import {
  Container,
  GlProgram,
  ImageSource,
  Mesh,
  MeshGeometry,
  Rectangle,
  Shader,
  Texture,
} from "pixi.js";
import defaultFragment from "./shader/default.frag";
import vertex from "./shader/default.vert";
import shinyFragment from "./shader/shiny.frag";
import type { BirdConfig } from "./types";

type BirdPose = "side" | "towards" | "away" | "moving";

type Textures<Keys extends string> = {
  [K in Keys]: Texture;
};

const headFrameNames = ["side", "towards", "away", "soar"] as const;
type HeadFrame = (typeof headFrameNames)[number];

const bodyFrameNames = [
  "side",
  "move1",
  "move2",
  "towards",
  "away",
  "soar",
] as const;
type BodyFrame = (typeof bodyFrameNames)[number];

type Shaders = { default: Shader; shiny: Shader };

type Position = { x: number; y: number };

interface BirdConstructorParams {
  config: BirdConfig;
  headSheetElement: HTMLImageElement;
  bodySheetElement: HTMLImageElement;
  viewfinderDimension: number;
  defaultContainerPosition: Position;
}

export class Bird {
  readonly pose: BirdPose = "side";

  readonly headFrame: HeadFrame = "side";
  readonly bodyFrame: BodyFrame = "towards";

  readonly flapAnimationSpeed: number = 10;
  readonly hasSoaringPose: boolean = false;

  readonly headFrameCount: number = 3;
  readonly bodyFrameCount: number = 5;

  readonly container: Container;
  readonly defaultContainerPosition: Position = { x: 0, y: 0 };

  readonly config: BirdConfig;
  readonly viewfinderDimension: number;

  readonly headTextures: Textures<HeadFrame>;
  readonly bodyTextures: Textures<BodyFrame>;

  readonly headFrameWidth: number;
  readonly headFrameHeight: number;

  readonly bodyFrameWidth: number;
  readonly bodyFrameHeight: number;

  readonly headGeometry: MeshGeometry;
  readonly bodyGeometry: MeshGeometry;

  readonly headShaders: Shaders;
  readonly bodyShaders: Shaders;

  readonly headMesh: Mesh<MeshGeometry, Shader>;
  readonly bodyMesh: Mesh<MeshGeometry, Shader>;

  readonly headOffset: Position;
  readonly bodyOffset: number;

  readonly frontBackOffsets: { head: number; foot: number };

  constructor({
    config,
    headSheetElement,
    bodySheetElement,
    viewfinderDimension,
    defaultContainerPosition,
  }: BirdConstructorParams) {
    this.config = config;
    this.viewfinderDimension = viewfinderDimension;

    this.defaultContainerPosition = defaultContainerPosition;

    this.flapAnimationSpeed = config.flap_animation_speed || 10;
    this.hasSoaringPose = config.has_soaring_pose || false;

    if (this.hasSoaringPose) {
      this.headFrameCount = 4;
      this.bodyFrameCount = 6;
    }

    this.headOffset = {
      x: config.visuals_config.head_position_in_side_pose.x * 100,
      y: config.visuals_config.head_position_in_side_pose.y * -100,
    };
    this.bodyOffset = config.visuals_config.body_position_y * -100;

    this.frontBackOffsets = {
      head: config.dimensions.perched_front_back.head_offset * 100,
      foot: config.dimensions.perched_front_back.foot_offset * 100,
    };

    this.container = new Container();
    this.container.pivot.x = this.container.width / 2;
    this.container.pivot.y = this.container.height / 2;
    this.setContainerPosition(
      this.defaultContainerPosition.x,
      this.defaultContainerPosition.y,
    );

    const {
      textures: headTextures,
      width: headFrameWidth,
      height: headFrameHeight,
    } = this.createTextures(
      headSheetElement,
      headFrameNames,
      this.headFrameCount,
    );
    this.headTextures = headTextures;
    this.headFrameWidth = headFrameWidth;
    this.headFrameHeight = headFrameHeight;

    const {
      textures: bodyTextures,
      width: bodyFrameWidth,
      height: bodyFrameHeight,
    } = this.createTextures(
      bodySheetElement,
      bodyFrameNames,
      this.bodyFrameCount,
    );
    this.bodyTextures = bodyTextures;
    this.bodyFrameWidth = bodyFrameWidth;
    this.bodyFrameHeight = bodyFrameHeight;

    this.headGeometry = this.createGeometry(
      this.headFrameWidth,
      this.headFrameHeight,
      this.headTextures[this.headFrame],
    );
    this.bodyGeometry = this.createGeometry(
      this.bodyFrameWidth,
      this.bodyFrameHeight,
      this.bodyTextures[this.bodyFrame],
    );

    this.headShaders = this.createShaders(this.headTextures[this.headFrame]);
    this.bodyShaders = this.createShaders(this.bodyTextures[this.bodyFrame]);

    this.headMesh = this.createMesh({
      geometry: this.headGeometry,
      shader: this.headShaders.default,
      frameWidth: this.headFrameWidth,
      frameHeight: this.headFrameHeight,
    });
    this.bodyMesh = this.createMesh({
      geometry: this.bodyGeometry,
      shader: this.bodyShaders.default,
      frameWidth: this.bodyFrameWidth,
      frameHeight: this.bodyFrameHeight,
    });

    this.headMesh.x = this.headOffset.x;
    this.headMesh.y = this.headOffset.y;

    this.bodyMesh.y = this.bodyOffset;

    this.container.addChild(this.headMesh);
    this.container.addChild(this.bodyMesh);

    this.setPose("towards");
  }

  private createTextures(
    sheetElement: HTMLImageElement,
    frameNames: typeof headFrameNames | typeof bodyFrameNames,
    frameCount: number,
  ) {
    const sheetImage = new ImageSource({ resource: sheetElement });
    const frameWidth = sheetImage.width / frameCount;
    const frameHeight = sheetImage.height;

    const textures = frameNames.reduce(
      (accumulator, frameName, index) => {
        return {
          ...accumulator,
          [frameName]: new Texture({
            source: sheetImage.source,
            frame: new Rectangle(
              frameWidth * index,
              0,
              frameWidth,
              frameHeight,
            ),
          }),
        };
      },
      {} as Textures<(typeof frameNames)[number]>,
    );

    return { textures, width: frameWidth, height: frameHeight };
  }

  private setContainerPosition(x: number, y: number) {
    this.container.x = x;
    this.container.y = y;
  }

  private createGeometry(
    frameWidth: number,
    frameHeight: number,
    frameTexture: Texture,
  ) {
    return new MeshGeometry({
      positions: new Float32Array([
        0,
        0, // x, y
        frameWidth,
        0, // x, y
        frameWidth,
        frameHeight, // x, y,
        0,
        frameHeight, // x, y,
      ]),
      uvs: new Float32Array(Object.values(frameTexture.uvs)),
      indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
    });
  }

  private createShaders(frameTexture: Texture) {
    return {
      default: new Shader({
        glProgram: new GlProgram({
          fragment: defaultFragment,
          vertex: vertex,
        }),
        resources: {
          uTexture: frameTexture.source,
        },
      }),
      shiny: new Shader({
        glProgram: new GlProgram({
          fragment: shinyFragment,
          vertex: vertex,
        }),
        resources: {
          uTexture: frameTexture.source,
          timeUniforms: {
            uTime: { value: 0.0, type: "f32" },
          },
        },
      }),
    };
  }

  private createMesh({
    geometry,
    shader,
    frameWidth,
    frameHeight,
  }: {
    geometry: MeshGeometry;
    shader: Shader;
    frameWidth: number;
    frameHeight: number;
  }) {
    return new Mesh({
      geometry,
      shader,
      pivot: { x: frameWidth / 2, y: frameHeight / 2 },
    });
  }

  updateTime(deltaMS: number) {
    const timeDelta = deltaMS / 1000;

    this.headShaders.shiny.resources.timeUniforms.uniforms.uTime += timeDelta;
    this.bodyShaders.shiny.resources.timeUniforms.uniforms.uTime += timeDelta;
  }

  private setHeadBehind() {
    this.bodyMesh.zIndex = 1;
    this.headMesh.zIndex = 0;
  }
  private setBodyBehind() {
    this.bodyMesh.zIndex = 0;
    this.headMesh.zIndex = 1;
  }

  setPose(pose: BirdPose) {
    if (pose === "side" || pose === "moving") {
      this.headMesh.x = this.headOffset.x;
    } else {
      this.headMesh.x = 0;
    }

    if (pose === "towards") {
      this.setBodyBehind();

      const newScale =
        1 /
        ((this.headOffset.y * -1 +
          this.frontBackOffsets.head -
          this.frontBackOffsets.foot) /
          this.viewfinderDimension);

      this.container.scale = newScale;
      this.container.y =
        this.defaultContainerPosition.y + this.frontBackOffsets.foot * newScale;
    }
  }

  setShiny(shiny = true) {
    if (shiny) {
      this.headMesh.shader = this.headShaders.shiny;
      this.bodyMesh.shader = this.bodyShaders.shiny;
    } else {
      this.headMesh.shader = this.headShaders.default;
      this.bodyMesh.shader = this.bodyShaders.default;
    }
  }
}
