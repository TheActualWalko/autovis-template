export interface StemInstantAnalysis {
  amplitude: number;
  [key: string]: number;
}

export interface StemInstantAnalysisMap {
  [key: string]: StemInstantAnalysis
}

export interface StemFullAnalysis {
  amplitude: number[];
}

export interface StemFullAnalysisMap {
  [key: string]: StemFullAnalysis;
}

export type ScenePartUpdater<T> = (part: T, analysis: StemInstantAnalysisMap, progress: number) => unknown

export type ScenePartSpec<T> = [
  T,
  ScenePartUpdater<T>?,
]

export type AsyncScenePartSpec<T> = [
  Promise<T>,
  ScenePartUpdater<T>?,
]

export type AnyScenePartSpec = (
  ScenePartSpec<THREE.PointLight> |
  ScenePartSpec<THREE.AmbientLight> |
  ScenePartSpec<THREE.DirectionalLight> |
  ScenePartSpec<THREE.SpotLight> |
  ScenePartSpec<THREE.RectAreaLight> |
  ScenePartSpec<THREE.PerspectiveCamera> |
  ScenePartSpec<THREE.OrthographicCamera> |
  ScenePartSpec<THREE.CubeCamera> |
  ScenePartSpec<THREE.ArrayCamera> |
  ScenePartSpec<THREE.Sprite> |
  ScenePartSpec<THREE.Mesh> |
  ScenePartSpec<Pass>
);

export type AnyAsyncScenePartSpec = (
  AsyncScenePartSpec<THREE.PointLight> |
  AsyncScenePartSpec<THREE.AmbientLight> |
  AsyncScenePartSpec<THREE.DirectionalLight> |
  AsyncScenePartSpec<THREE.SpotLight> |
  AsyncScenePartSpec<THREE.RectAreaLight> |
  AsyncScenePartSpec<THREE.PerspectiveCamera> |
  AsyncScenePartSpec<THREE.OrthographicCamera> |
  AsyncScenePartSpec<THREE.CubeCamera> |
  AsyncScenePartSpec<THREE.ArrayCamera> |
  AsyncScenePartSpec<THREE.Sprite> |
  AsyncScenePartSpec<THREE.Mesh> |
  AsyncScenePartSpec<Pass>
);
