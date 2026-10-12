import type { Bird, BirdPose, Direction } from "./bird";
import { capitaliseFirstLetter } from "./utils";

export const createControls = (bird: Bird) => {
  const shinyCheckbox = document.createElement("input");
  shinyCheckbox.type = "checkbox";
  shinyCheckbox.id = "shiny";

  shinyCheckbox.onchange = (e) => {
    if (e.target && e.target instanceof HTMLInputElement) {
      bird.setShiny(e.target.checked);
    }
  };

  const poseDropdown = document.createElement("select");
  poseDropdown.id = "pose";
  bird.poseOptions.forEach((poseName) => {
    const option = document.createElement("option");
    option.textContent =
      poseName === "moving"
        ? bird.movingPoseLabel
        : capitaliseFirstLetter(poseName);
    option.value = poseName;
    poseDropdown.append(option);
  });

  poseDropdown.value = bird.pose;
  poseDropdown.onchange = (e) => {
    if (e.target && e.target instanceof HTMLSelectElement && e.target.value) {
      bird.setPose(e.target.value as BirdPose);
    }
  };

  const directionDropdown = document.createElement("select");
  directionDropdown.id = "direction";
  ["left", "right"].forEach((direction) => {
    const option = document.createElement("option");
    option.textContent = capitaliseFirstLetter(direction);
    option.value = direction;
    directionDropdown.append(option);
  });

  directionDropdown.value = bird.direction;
  directionDropdown.onchange = (e) => {
    if (e.target && e.target instanceof HTMLSelectElement && e.target.value) {
      bird.setDirection(e.target.value as Direction);
    }
  };

  const controlsDiv = document.createElement("div");

  [
    { label: "Pose", input: poseDropdown },
    { label: "Bird direction", input: directionDropdown },
    { label: "Shiny preview", input: shinyCheckbox },
  ].forEach((control) => {
    const row = document.createElement("div");
    row.className = "control-row";
    const labelCell = document.createElement("div");
    const inputCell = document.createElement("div");

    row.append(labelCell, inputCell);

    const label = document.createElement("label");
    label.textContent = control.label;
    label.htmlFor = control.input.id;
    labelCell.append(label);

    inputCell.append(control.input);

    controlsDiv.append(row);
  });

  return controlsDiv;
};
