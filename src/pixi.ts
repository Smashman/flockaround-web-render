import {
  Application,
  Assets,
  Container,
  GlProgram,
  Graphics,
  Mesh,
  MeshGeometry,
  Rectangle,
  Shader,
  Texture,
} from "pixi.js";
import { getPathTail } from "./utils";
import vertex from "./shader/default.vert";
import defaultFragment from "./shader/default.frag";
import shinyFragment from "./shader/shiny.frag";

const DEBUG = false;

const configName = "MuteSwan";

export const initialisePixiApp = async () => {
  const app = new Application();
  await app.init({
    backgroundColor: "#348096",
    width: 1000,
    height: 1000,
    preference: "webgl",
  });

  document.body.append(app.canvas);

  return app;
};

export const drawPixiBird = async () => {
  const app = await initialisePixiApp();

  const configPath = `configs/BirdSpecies_${configName}.json`;
  const response = await fetch(configPath);
  const birdConfig = (await response.json()) as BirdConfig;

  const visualsConfig = birdConfig.visuals_config;
  const flapAnimationSpeed = birdConfig.flap_animation_speed;

  const headOffset = {
    x: visualsConfig.head_position_in_side_pose.x * 100,
    y: visualsConfig.head_position_in_side_pose.y * 100 * -1,
  };
  const bodyOffset = visualsConfig.body_position_y * 100 * -1;

  const headSheetPath = `img/${getPathTail(birdConfig.head_texture.path)}`;
  const bodySheetPath = `img/${getPathTail(birdConfig.body_texture.path)}`;

  const birdContainer = new Container();
  birdContainer.pivot.x = birdContainer.width / 2;
  birdContainer.pivot.y = birdContainer.height / 2;

  app.stage.addChild(birdContainer);

  const headSheet = await Assets.load<Texture>(headSheetPath);
  const headFrames = 3;
  const headWidth = headSheet.width / headFrames;

  const headTextures = {
    side: new Texture({
      source: headSheet.source,
      frame: new Rectangle(0, 0, headWidth, headSheet.height),
    }),
    towards: new Texture({
      source: headSheet.source,
      frame: new Rectangle(headWidth, 0, headWidth, headSheet.height),
    }),
    away: new Texture({
      source: headSheet.source,
      frame: new Rectangle(headWidth * 2, 0, headWidth, headSheet.height),
    }),
    soar: new Texture({
      source: headSheet.source,
      frame: new Rectangle(headWidth * 3, 0, headWidth, headSheet.height),
    }),
  };

  const headGeometry = new MeshGeometry({
    positions: new Float32Array([
      0,
      0, // x, y
      headWidth,
      0, // x, y
      headWidth,
      headSheet.height, // x, y,
      0,
      headSheet.height, // x, y,
    ]),
    uvs: new Float32Array(Object.values(headTextures.side.uvs)),
    indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
  });

  const headShader = new Shader({
    glProgram: new GlProgram({
      fragment: defaultFragment,
      vertex: vertex,
    }),
    resources: {
      uTexture: headTextures.side.source,
    },
  });
  const headShinyShader = new Shader({
    glProgram: new GlProgram({
      fragment: shinyFragment,
      vertex: vertex,
    }),
    resources: {
      uTexture: headTextures.side.source,
      timeUniforms: {
        uTime: { value: 0.0, type: "f32" },
      },
    },
  });

  const headMesh = new Mesh({
    geometry: headGeometry,
    shader: headShader,
    pivot: { x: headWidth / 2, y: headSheet.height / 2 },
  });
  // headMesh.rotation = Math.PI / 4;
  // headMesh.scale.set(-1, 1);

  const bodySheet = await Assets.load<Texture>(bodySheetPath);
  const bodyFrames = 5;
  const bodyWidth = bodySheet.width / bodyFrames;

  const bodyTextures = {
    side: new Texture({
      source: bodySheet.source,
      frame: new Rectangle(0, 0, bodyWidth, bodySheet.height),
    }),
    flyUp: new Texture({
      source: bodySheet.source,
      frame: new Rectangle(bodyWidth, 0, bodyWidth, bodySheet.height),
    }),
    flyDown: new Texture({
      source: bodySheet.source,
      frame: new Rectangle(bodyWidth * 2, 0, bodyWidth, bodySheet.height),
    }),
    towards: new Texture({
      source: bodySheet.source,
      frame: new Rectangle(bodyWidth * 3, 0, bodyWidth, bodySheet.height),
    }),
    away: new Texture({
      source: bodySheet.source,
      frame: new Rectangle(bodyWidth * 4, 0, bodyWidth, bodySheet.height),
    }),
    soar: new Texture({
      source: bodySheet.source,
      frame: new Rectangle(bodyWidth * 5, 0, bodyWidth, bodySheet.height),
    }),
  };

  const bodyGeometry = new MeshGeometry({
    positions: new Float32Array([
      0,
      0, // x, y
      bodyWidth,
      0, // x, y
      bodyWidth,
      bodySheet.height, // x, y,
      0,
      bodySheet.height, // x, y,
    ]),
    uvs: new Float32Array(Object.values(bodyTextures.side.uvs)),
    indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
  });

  const bodyShader = new Shader({
    glProgram: new GlProgram({
      fragment: defaultFragment,
      vertex: vertex,
    }),
    resources: {
      uTexture: bodyTextures.side.source,
    },
  });
  const bodyShinyShader = new Shader({
    glProgram: new GlProgram({
      fragment: shinyFragment,
      vertex: vertex,
    }),
    resources: {
      uTexture: bodyTextures.side.source,
      timeUniforms: {
        uTime: { value: 0.0, type: "f32" },
      },
    },
  });
  const bodyMesh = new Mesh({
    geometry: bodyGeometry,
    shader: bodyShader,
    pivot: { x: bodyWidth / 2, y: bodySheet.height / 2 },
  });

  birdContainer.addChild(headMesh);
  birdContainer.addChild(bodyMesh);

  birdContainer.x = app.screen.width / 2;
  birdContainer.y = app.screen.height / 2 + 200;

  // birdContainer.scale.set(-1, 1);

  // birdContainer.width = 200;
  // birdContainer.height = 200;

  headMesh.x = headOffset.x;
  headMesh.y = headOffset.y;

  bodyMesh.y = bodyOffset;

  bodyMesh.zIndex = 0;
  headMesh.zIndex = 1;

  if (DEBUG) {
    const centerPoint = new Graphics().circle(0, 0, 5).fill("red");
    birdContainer.addChild(centerPoint);
    centerPoint.zIndex = 100;
  }

  const timeDelta = 1 / 60;
  let flapTimer = 0;

  let flying = false;
  let flyUpPose = false;

  app.ticker.add((ticker) => {
    headShinyShader.resources.timeUniforms.uniforms.uTime += timeDelta;
    bodyShinyShader.resources.timeUniforms.uniforms.uTime += timeDelta;

    flapTimer += ticker.elapsedMS * flapAnimationSpeed;

    if (flapTimer >= 1000) {
      flapTimer %= 1000;
      if (flying) {
        if (!flyUpPose) {
          bodyGeometry.uvs = new Float32Array(
            Object.values(bodyTextures.flyUp.uvs),
          );
          flyUpPose = true;
        } else {
          bodyGeometry.uvs = new Float32Array(
            Object.values(bodyTextures.flyDown.uvs),
          );
          flyUpPose = false;
        }
      }
    }
  });
};
