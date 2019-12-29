import pad from './pad';

export default = (currentTime) => {
  const minutes = Math.floor(currentTime / 60);
  const seconds = Math.floor(currentTime % 60);
  return `${pad(minutes, 2)}:${pad(seconds, 2)}`;
}