import THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

const loader = new STLLoader();

export default (path: string): Promise<THREE.BufferGeometry> => new Promise((resolve, reject) => {
  console.log('loading stl', path);
  loader.load(path, (geometry) => {
    console.log('done loading', path);
    resolve(geometry);
  });
});
