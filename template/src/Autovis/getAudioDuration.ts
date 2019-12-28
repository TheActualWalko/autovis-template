export default (url: string): Promise<number> => new Promise((resolve, reject) => {
  const audio = new Audio(url);
  audio.addEventListener('canplay', () => {
    resolve(audio.duration);
  });
});
