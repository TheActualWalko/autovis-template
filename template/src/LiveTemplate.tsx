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
    // these custom frequency bands will be inspected continuously, and passed in when rendering each frame.
    // they can be accessed with analysis.live.yourFrequencyBandNameHere.
    analysisFrequencies={{
      low: 100,
      mid: 1000,
      high: 10000,
      someOtherFrequencyBand: 1337
    }}
    sceneParts={[
      // Make the camera zoom and shake a bit when low frequencies are loud
      part(
        positionObject(new THREE.PerspectiveCamera(55, width/height, 0.1, 1000), 0, 0, 4),
        (camera, analysis, time) => {
          camera.position.x = (analysis.live.low * 0.03) * Math.sin(time * 100);
        }
      ),

      part(new UnrealBloomPass(new THREE.Vector2(512, 512), 0.75, 0.4, 0.85)),

      part(
        new GlitchPass(),
        (pass, analysis) => {
          pass.randX = 20
          pass.curF = analysis.live.amplitude > 0.7 ? 1 : 19
        }
      ),

      // Four lights that get brighter with high frequencies
      ...[
        [ 4, 0,  1],
        [-4, 0,  1],
        [-2, 0, -1],
        [ 2, 0, -1],
      ].map(([x, y, z]) =>
        part(
          positionObject(new THREE.PointLight(0xffffff, 0.2), x, y, z),
          (light, analysis) => light.intensity = 0.1 + (1.5 * analysis.live.high)
        )
      ),

      // The central dodecahedron
      part(
        positionObject(
          new THREE.Mesh(new THREE.DodecahedronGeometry(0.5), new THREE.MeshStandardMaterial({ color: 0xffffff, dithering: true, emissive: 0 })),
          0, 0, 0
        ),
        (mesh, analysis, time) => {
          // The dodecahedron bounces a little bit with low frequencies.
          mesh.position.y = -0.1 * analysis.live.low;

          // The dodecahedron squishes a little bit with mid frequencies.
          mesh.scale.x = 1 + (0.4 * analysis.live.mid);
          mesh.scale.y = 1 - (0.4 * analysis.live.mid);

          // The dodecahedron's rotation is continuous, based on the passage of time. Time gives a value in seconds.
          // Using the `time` argument will make it easy to share parts across live and non-live autovis scenes.
          mesh.rotation.z = time;
          mesh.rotation.y = time / 2;

          // The mesh flashes white with amplitude.
          if (!(mesh.material instanceof Array)) {
            (mesh.material as THREE.MeshStandardMaterial).emissive.setScalar(analysis.live.amplitude);
          }
        },
      ),
    ]}
  />
);
