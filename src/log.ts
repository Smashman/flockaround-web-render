export const logError = (...args: Parameters<Console["error"]>) => {
  console.error("FlockAround Bird Web Render |", ...args);
};

export class RenderError extends Error {
  constructor(...params: Parameters<ErrorConstructor>) {
    super(...params);
    this.name = this.constructor.name;
  }
}
