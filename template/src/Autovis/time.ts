let lastTimeReported: number;
let lastTimeChecked: number;

export const updateTimeRef = (reportedTime: number) => {
  lastTimeReported = reportedTime;
  lastTimeChecked = Date.now();
}

export const getCurrentTime = () => {
  if (lastTimeReported === undefined || lastTimeChecked === undefined) {
    return 0;
  }
  const now = Date.now();
  return lastTimeReported + ((now - lastTimeChecked) / 1000)
};
