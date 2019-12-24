import downsample from './downsample';
import shrink from './shrink';

const analyzeAmplitude = (audio: AudioBuffer) => {
  const output = new Float32Array(audio.length);
  const channels = [audio.getChannelData(0), audio.getChannelData(1)];
  for (let i = 0; i < audio.length; i ++) {
    output[i] = channels.map((b) => Math.abs(b[i])).reduce((a, b) => a + b) / channels.length;
  }
  return output;
};

export default (audio: AudioBuffer, frameCount: number) => {
  return {
    amplitude: shrink(downsample(analyzeAmplitude(audio), frameCount))
  }
};
