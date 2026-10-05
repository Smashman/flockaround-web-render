import { drawPixiBird } from "./pixi";

(() => {
  const elementsToRender = document.getElementsByClassName("bird-web-render");

  Array.from(elementsToRender).forEach((element) => {
    if (element instanceof HTMLDivElement) {
      drawPixiBird(element);
    }
  });
})();
