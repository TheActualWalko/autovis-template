import { StemFullAnalysisMap, StemInstantAnalysisMap } from './types';

export default (fullAnalysis: StemFullAnalysisMap, frame: number) => {
  const output: StemInstantAnalysisMap = {};
  Object.keys(fullAnalysis).forEach((k) => {
    output[k] = {} as any;
    Object.keys(fullAnalysis[k]).forEach((property) => {
      (output[k] as any)[property] = (fullAnalysis[k] as any)[property][frame];
    });
  });
  return output;
}
