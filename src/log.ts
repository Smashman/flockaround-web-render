export const logError = (...args: Parameters<Console["error"]>) => {
  console.error("FlockAround Bird Web Render |", ...args);
};
