import { TypedArray } from 'three';

export default (input: TypedArray | number[], desiredLength: number, combinationFunction = Math.max.bind(Math)) => {
  const outputArray = Array(desiredLength).fill(0);
  const ratio = input.length / desiredLength;
  if (ratio < 1) {
    throw new Error('downsample cannot upsample!');
  }
  let currentSampleValues = [];
  let currentOutputSampleIndex = 0;
  for (let i = 0; i < input.length; i ++) {
    const outputSampleIndex = Math.floor(i / ratio);
    if (outputSampleIndex !== currentOutputSampleIndex) {
      outputArray[currentOutputSampleIndex] = combinationFunction(...currentSampleValues);
      currentSampleValues = [];
      currentOutputSampleIndex = outputSampleIndex;
    }
    currentSampleValues.push(input[i]);
  }
  if (currentSampleValues.length) {
    outputArray[currentOutputSampleIndex] = combinationFunction(...currentSampleValues);
  }
  return outputArray;
};
