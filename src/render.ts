import { Application, Container, Graphics } from "pixi.js";
import { Bird, type BirdPose } from "./bird";
import { DEBUG_MODE } from "./constants";
import { RenderError } from "./log";
import type { BirdConfig } from "./types";

const canvasDimension = 300;
// In-game camera viewfinder = 45%
// const viewfinderDimension = canvasDimension * 0.45;

const viewfinderDimension = canvasDimension * 0.85;

const initialisePixiApp = async (renderElement: HTMLDivElement) => {
  const app = new Application();
  await app.init({
    backgroundColor: "#348096",
    width: canvasDimension,
    height: canvasDimension,
    preference: "webgl",
  });

  renderElement.append(app.canvas);

  return app;
};

const getConfigAndImages = async (renderElement: HTMLDivElement) => {
  const configText = renderElement.querySelector(".config")?.textContent;
  if (!configText) {
    throw new RenderError("Config text not available. Exiting");
  }
  const config = JSON.parse(configText) as BirdConfig;

  const headSheetElement = renderElement.querySelector(".head-spritesheet");
  if (!headSheetElement || !(headSheetElement instanceof HTMLImageElement)) {
    throw new RenderError("Head spritesheet not available. Exiting");
  }

  const bodySheetElement = renderElement.querySelector(".body-spritesheet");
  if (!bodySheetElement || !(bodySheetElement instanceof HTMLImageElement)) {
    throw new RenderError("Body spritesheet not available. Exiting");
  }

  const imageLoadError = new RenderError("Image failed to load. Exiting");

  // Ensure images are loaded
  await Promise.all(
    [headSheetElement, bodySheetElement].map(
      (element) =>
        new Promise<void>((resolve, reject) => {
          if (element.complete) {
            if (element.width && element.height) {
              resolve();
            } else {
              reject(imageLoadError);
            }
            return;
          }
          element.loading = "eager";
          element.addEventListener("load", () => resolve());
          element.addEventListener("error", () => {
            reject(imageLoadError);
          });
        }),
    ),
  );

  return { config, headSheetElement, bodySheetElement };
};

export const renderBird = async (renderElement: HTMLDivElement) => {
  const { config, headSheetElement, bodySheetElement } =
    await getConfigAndImages(renderElement);

  const app = await initialisePixiApp(renderElement);

  const mainContainer = new Container();
  mainContainer.width = viewfinderDimension;
  mainContainer.height = viewfinderDimension;
  mainContainer.position.x = canvasDimension / 2;
  mainContainer.position.y = canvasDimension / 2 + viewfinderDimension / 2;

  app.stage.addChild(mainContainer);

  const bird = new Bird({
    config,
    headSheetElement,
    bodySheetElement,
    viewfinderDimension,
  });

  mainContainer.addChild(bird.container);

  if (DEBUG_MODE) {
    const debugContainer = new Container();
    debugContainer.zIndex = 100;
    debugContainer.x = canvasDimension / 2;
    debugContainer.y = canvasDimension / 2;

    app.stage.addChild(debugContainer);

    const centrePoint = new Graphics().circle(0, 0, 5).stroke({
      width: 2,
      color: "#00ff00",
    });

    const footPoint = new Graphics()
      .circle(0, viewfinderDimension / 2, 5)
      .stroke({
        width: 2,
        color: "red",
      });
    const headPoint = new Graphics()
      .circle(0, -viewfinderDimension / 2, 5)
      .stroke({
        width: 2,
        color: "yellow",
      });

    const encompassingCircle = new Graphics()
      .circle(0, 0, viewfinderDimension / 2)
      .stroke({
        width: 2,
        color: "rebeccapurple",
      });

    const viewfinderLine = new Graphics()
      .moveTo(0, -viewfinderDimension / 2)
      .lineTo(0, viewfinderDimension / 2)
      .stroke({ width: 2, color: "white" });

    debugContainer.addChild(
      centrePoint,
      footPoint,
      headPoint,
      encompassingCircle,
      viewfinderLine,
    );
  }

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  renderElement.append(checkbox);

  checkbox.onchange = (e) => {
    if (e.target && e.target instanceof HTMLInputElement && e.target.checked) {
      bird.setShiny();
    } else {
      bird.setShiny(false);
    }
  };

  const poseDropdown = document.createElement("select");
  poseDropdown.name = "Pose";
  bird.poseOptions.forEach((poseName) => {
    const option = document.createElement("option");
    option.textContent =
      poseName === "moving"
        ? bird.movingPoseLabel
        : `${poseName.charAt(0).toUpperCase()}${poseName.substring(1)}`;
    option.value = poseName;
    poseDropdown.append(option);
  });

  renderElement.append(poseDropdown);

  poseDropdown.value = bird.pose;
  poseDropdown.onchange = (e) => {
    if (e.target && e.target instanceof HTMLSelectElement && e.target.value) {
      bird.setPose(e.target.value as BirdPose);
    }
  };

  app.ticker.add((ticker) => {
    bird.updateTime(ticker.deltaMS);
  });
};
