export const formatDuration = (duration) => {
  duration = Math.floor(duration / 1000);
  const seconds = duration % 60;
  duration = Math.floor(duration / 60);
  const minutes = duration % 60;
  const hours = Math.floor(duration / 60);
  return [hours > 0 ? hours : null, minutes, seconds]
    .filter((x) => x !== null)
    .map((x) => (x < 10 ? "0" : "") + x)
    .join(":");
};

export const formatTime = (timestamp) => {
  return new Date(timestamp).toTimeString().split(" ")[0];
};
