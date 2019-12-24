export default (input: number[], digits = 5) => input.map((x) => +x.toFixed(digits));
