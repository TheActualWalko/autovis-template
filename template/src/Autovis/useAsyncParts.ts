import { useEffect, useState } from 'react';
import { AnyAsyncScenePartSpec, AnyScenePartSpec } from './types';

export default (asyncParts: AnyAsyncScenePartSpec[]) => {
  const [parts, setParts] = useState<AnyScenePartSpec[]>([]);

  useEffect(
    () => {
      Promise
        .all(asyncParts.map(([objectPromise]) => objectPromise))
        .then((objects) => asyncParts.map(([_, updater], index) => [objects[index], updater]) as AnyScenePartSpec[])
        .then(setParts);
    },
    [asyncParts, setParts]
  );

  return parts;
}
