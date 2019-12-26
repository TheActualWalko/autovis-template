export interface StemInstantAnalysis {
  amplitude: number
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
