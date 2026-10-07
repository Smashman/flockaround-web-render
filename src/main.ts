import { logError, RenderError } from "./log";
import { renderBird } from "./render";

(() => {
  const elementsToRender = document.getElementsByClassName("bird-web-render");

  Array.from(elementsToRender).forEach(async (element) => {
    if (element instanceof HTMLDivElement) {
      try {
        await renderBird(element);
      } catch (e) {
        if (e instanceof RenderError) {
          logError(e.message);
          return;
        }
        logError(e);
      }
    }
  });
})();
