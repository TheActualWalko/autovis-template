import React from 'react';
import ReactDOM from 'react-dom';
import * as THREE from 'three';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import Autovis, { part } from './Autovis';

// A utility function that makes the code below a little shorter.
const positionObject = <T extends THREE.Object3D>(thing: T, x=0, y=0, z=0) => {
  thing.position.x = x;
  thing.position.y = y;
  thing.position.z = z;
  return thing;
}

const width = 960;
const height = 540;

ReactDOM.render(
  <Autovis
    frameRate={60}
    width={width}
    height={height}
    // You can leave these props out to play the whole song.
    startTime={0}
    endTime={34}
    masterURL={require('./audio/Born-Steel_Edge-Master-Short.mp3')}
    stemURLs={{
      kick: require('./audio/stems/Born-Steel_Edge-Kick-Short.mp3'),
      clap: require('./audio/stems/Born-Steel_Edge-Clap-Short.mp3'),
      hat: require('./audio/stems/Born-Steel_Edge-Hat-Short.mp3'),
    }}
    sceneParts={[
      // Make the camera zoom and shake a bit when the kick is loud
      part(
        positionObject(new THREE.PerspectiveCamera(55, width/height, 0.1, 1000), 0, 0, 4),
        (camera, analysis, time) => {
          camera.position.x = (analysis.kick.amplitude * 0.03) * Math.sin(time * 100);
        }
      ),

      part(
        new UnrealBloomPass(new THREE.Vector2(512, 512), 0.5, 5, 0.015),
        (pass, analysis) => {
          pass.radius = 5 + 50 * analysis.hat.amplitude
        }
      ),

      part(
        new GlitchPass(),
        (pass, analysis) => {
          pass.randX = 20
          pass.curF = analysis.kick.amplitude > 0.5 ? 1 : 19
        }
      ),

      // Four lights that get brighter with the clap
      ...[
        [ 4, 0,  1],
        [-4, 0,  1],
        [-2, 0, -1],
        [ 2, 0, -1],
      ].map(([x, y, z]) =>
        part(
          positionObject(new THREE.PointLight(0xffffff, 0.2), x, y, z),
          (light, analysis) => light.intensity = 0.1 + (0.9 * analysis.clap.amplitude)
        )
      ),

      // The central dodecahedron
      part(
        positionObject(
          new THREE.Mesh(new THREE.DodecahedronGeometry(0.5), new THREE.MeshStandardMaterial({ color: 0xffffff, dithering: true, emissive: 0 })),
          0, 0, 0
        ),
        (mesh, analysis, time) => {
          // The dodecahedron bounces a little bit with the kick.
          mesh.position.y = -0.1 * analysis.kick.amplitude;

          // The dodecahedron squishes a little bit with the clap.
          mesh.scale.x = 1 + (0.4 * analysis.clap.amplitude);
          mesh.scale.y = 1 - (0.4 * analysis.clap.amplitude);

          // The dodecahedron's rotation is based on # of seconds into the song.
          // Using the `time` argument instead of Date.now() or some other real-world time scale ensures that
          // the rotation is always the same at the same moment of the song.
          mesh.rotation.z = time;
          mesh.rotation.y = time / 2;

          // The mesh flashes white with the kick.
          if (!(mesh.material instanceof Array)) {
            (mesh.material as THREE.MeshStandardMaterial).emissive.setScalar(analysis.kick.amplitude);
          }
        },
      ),
    ]}
  />,
  document.getElementById('root')
);
