import audioContext from './audioContext';

function getAudioData(path: string) {
  return new Promise<AudioBuffer>((resolve, reject) => {
    var request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
      var audioData = request.response;
      audioContext.decodeAudioData(audioData).then(resolve).catch(reject);
    }
    request.send();
  });
}

export default (path: string): Promise<AudioBuffer> => getAudioData(path);
