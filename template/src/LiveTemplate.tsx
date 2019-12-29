import React from 'react';
import * as THREE from 'three';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import AutovisLive from './Autovis/Live';
import { part } from './Autovis';

// A utility function that makes the code below a little shorter.
const positionObject = <T extends THREE.Object3D>(thing: T, x=0, y=0, z=0) => {
  thing.position.x = x;
  thing.position.y = y;
  thing.position.z = z;
  return thing;
}

const width = 960;
const height = 540;

export default () => (
  <AutovisLive
    width={width}
    height={height}
    analysisFrequencies={[100, 1000, 10000]}
    // You can leave these props out to play the whole song.
    sceneParts={[
      // Make the camera zoom and shake a bit when the kick is loud
      part(
        positionObject(new THREE.PerspectiveCamera(55, width/height, 0.1, 1000), 0, 0, 4),
        (camera, analysis, time) => {
          camera.position.x = (analysis.live.f100 * 0.03) * Math.sin(time * 100);
        }
      ),

      part(new UnrealBloomPass(new THREE.Vector2(512, 512), 0.75, 0.4, 0.85)),

      part(
        new GlitchPass(),
        (pass, analysis) => {
          pass.randX = 20
          pass.curF = analysis.live.f100 > 0.4 ? 1 : 19
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
          (light, analysis) => light.intensity = 0.1 + (0.9 * analysis.live.f10000)
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
          mesh.position.y = -0.1 * analysis.live.f100;

          // The dodecahedron squishes a little bit with the clap.
          mesh.scale.x = 1 + (0.4 * analysis.live.f100);
          mesh.scale.y = 1 - (0.4 * analysis.live.f100);

          // The dodecahedron's rotation is based on # of seconds into the song.
          // Using the `time` argument instead of Date.now() or some other real-world time scale ensures that
          // the rotation is always the same at the same moment of the song.
          mesh.rotation.z = time;
          mesh.rotation.y = time / 2;

          // The mesh flashes white with the kick.
          if (!(mesh.material instanceof Array)) {
            (mesh.material as THREE.MeshStandardMaterial).emissive.setScalar(analysis.live.amplitude);
          }
        },
      ),
    ]}
  />
);
