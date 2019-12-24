export default (x: number, length: number) => {
  let output = x.toFixed(0);
  while (output.length < length) {
    output = '0' + output;
  }
  return output;
}
