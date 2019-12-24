export default (url: string): Promise<number> => new Promise((resolve, reject) => {
  const audio = new Audio(url);
  audio.addEventListener('canplay', () => {
    console.log(audio.duration);
    resolve(audio.duration);
  });
});
