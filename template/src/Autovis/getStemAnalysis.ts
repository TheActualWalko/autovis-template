import { StemFullAnalysis } from './types';
import decodeAudio from './decodeAudio';
import analyzeAudio from './analyzeAudio';

export default async (stemURLs: {[key: string]: string }, frameCount: number) => {
  const storedFrameCount = localStorage.getItem('frameCount');
  if (storedFrameCount !== String(frameCount)) {
    localStorage.clear();
  }
  localStorage.setItem('frameCount', String(frameCount));
  const stemAnalysis: {[key: string]: StemFullAnalysis } = {};
  const stemKeys = Object.keys(stemURLs);
  for (let i = 0; i < stemKeys.length; i ++) {
    const key = stemKeys[i];
    const storageKey = `${frameCount}::${stemURLs[key]}`;
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
      stemAnalysis[key] = JSON.parse(storedData);
    } else {
      const audio = await decodeAudio(stemURLs[key]);
      stemAnalysis[key] = analyzeAudio(audio, frameCount);
      localStorage.setItem(storageKey, JSON.stringify(stemAnalysis[key]));
    }
  }
  return stemAnalysis;
}
