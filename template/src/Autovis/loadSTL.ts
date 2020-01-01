import THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

const loader = new STLLoader();

export default (path: string): Promise<THREE.BufferGeometry> => new Promise((resolve, reject) => {
  loader.load(path, (geometry) => {
    resolve(geometry);
  });
});
