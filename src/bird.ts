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
import type {
  BirdConfig,
  BirdDimensionXY,
  OneDimensionalBirdConfigDimensionOffsets,
  TwoDimensionalBirdConfigDimensionOffsets,
} from "./types";

const birdPoseNames = ["front", "side", "moving", "back", "soar"] as const;
export type BirdPose = (typeof birdPoseNames)[number];

type MovingPoseLabel = "Flying" | "Running" | "Swimming";

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

interface Offsets<Dimension extends Position | number = Position> {
  head: Dimension;
  foot: Dimension;
  centre: Dimension;
  size: number;
}

type OneDimensionalOffsets = Offsets<number>;
type TwoDimensionalOffsets = Offsets<Position>;

type Position = { x: number; y: number };

interface BirdConstructorParams {
  config: BirdConfig;
  headSheetElement: HTMLImageElement;
  bodySheetElement: HTMLImageElement;
  viewfinderDimension: number;
}

const defaultValues: {
  pose: BirdPose;
  headFrame: HeadFrame;
  bodyFrame: BodyFrame;
  movingPoseLabel: MovingPoseLabel;
} = {
  pose: "side",
  headFrame: "side",
  bodyFrame: "side",
  movingPoseLabel: "Flying",
};

export class Bird {
  _pose: BirdPose = defaultValues.pose;

  get pose() {
    return this._pose;
  }

  readonly poseOptions: BirdPose[];
  movingPoseLabel = defaultValues.movingPoseLabel;

  readonly flapAnimationSpeed: number = 10;
  readonly hasSoaringPose: boolean = false;

  readonly headFrameCount: number = 3;
  readonly bodyFrameCount: number = 5;

  readonly container: Container;
  readonly defaultPosition: Position = { x: 0, y: 0 };

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

  readonly frontBackOffsets: OneDimensionalOffsets;
  readonly soarOffsets: OneDimensionalOffsets;
  readonly sideOffsets: TwoDimensionalOffsets;
  readonly movingOffsets: TwoDimensionalOffsets;
  readonly peckingOffsets: TwoDimensionalOffsets;

  constructor({
    config,
    headSheetElement,
    bodySheetElement,
    viewfinderDimension,
  }: BirdConstructorParams) {
    this.config = config;
    this.viewfinderDimension = viewfinderDimension;

    // if (config.movingPoseLabel) {
    //   this.movingPoseLabel = config.movingPoseLabel;
    // }

    this.flapAnimationSpeed = config.flap_animation_speed || 10;
    this.hasSoaringPose = config.has_soaring_pose || false;

    if (this.hasSoaringPose) {
      this.headFrameCount = 4;
      this.bodyFrameCount = 6;
      this.poseOptions = [...birdPoseNames];
    } else {
      this.poseOptions = [...birdPoseNames.slice(0, 4)];
    }

    this.headOffset = {
      x: config.visuals_config.head_position_in_side_pose.x * 100,
      y: config.visuals_config.head_position_in_side_pose.y * -100,
    };
    this.bodyOffset = config.visuals_config.body_position_y * -100;

    this.frontBackOffsets = Bird.oneDimensionalConfigOffsetsToLocal(
      config.dimensions.perched_front_back,
    );
    this.soarOffsets = Bird.oneDimensionalConfigOffsetsToLocal(
      config.dimensions.soaring,
    );
    this.sideOffsets = Bird.twoDimensionalConfigOffsetsToLocal(
      config.dimensions.perched_side,
    );
    this.movingOffsets = Bird.twoDimensionalConfigOffsetsToLocal(
      config.dimensions.flying_side,
    );
    this.peckingOffsets = Bird.twoDimensionalConfigOffsetsToLocal(
      config.dimensions.sideways,
    );

    this.container = new Container();

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
      this.headTextures[defaultValues.headFrame],
    );
    this.bodyGeometry = this.createGeometry(
      this.bodyFrameWidth,
      this.bodyFrameHeight,
      this.bodyTextures[defaultValues.bodyFrame],
    );

    this.headShaders = this.createShaders(
      this.headTextures[defaultValues.headFrame],
    );
    this.bodyShaders = this.createShaders(
      this.bodyTextures[defaultValues.bodyFrame],
    );

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

    this.container.addChild(this.headMesh, this.bodyMesh);

    this.setPose(defaultValues.pose);
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

  private setScale(scale: number) {
    this.container.scale = scale;
  }

  private setPosition(position: Partial<Position>) {
    this.container.x = position.x || this.defaultPosition.x;
    this.container.y = position.y || this.defaultPosition.y;
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

  private setHeadFrame(frame: HeadFrame) {
    this.headGeometry.uvs = new Float32Array(
      Object.values(this.headTextures[frame].uvs),
    );
  }

  private setBodyFrame(frame: BodyFrame) {
    this.bodyGeometry.uvs = new Float32Array(
      Object.values(this.bodyTextures[frame].uvs),
    );
  }

  private calculateOneDimensionScalePosition(offsets: OneDimensionalOffsets) {
    const newScale =
      1 /
      ((this.headOffset.y * -1 + offsets.head - offsets.foot) /
        this.viewfinderDimension);
    return {
      scale: newScale,
      yPosition: offsets.foot * newScale,
    };
  }

  private calculateTwoDimensionScalePosition(offsets: TwoDimensionalOffsets) {
    const oppositeLength = this.headOffset.y + offsets.head.y - offsets.foot.y;
    const adjacentLength = offsets.foot.x + this.headOffset.x + offsets.head.x;

    const hypotenuseLength = Math.sqrt(
      Math.pow(adjacentLength, 2) + Math.pow(oppositeLength, 2),
    );

    const newScale = this.viewfinderDimension / hypotenuseLength;

    const midPointOfHypotenuse = {
      x: this.headOffset.x + offsets.head.x - adjacentLength / 2,
      y: offsets.foot.y + oppositeLength / 2,
    };

    const newPosition = {
      x: -midPointOfHypotenuse.x * newScale,
      y: -midPointOfHypotenuse.y * newScale - this.viewfinderDimension / 2,
    };

    return {
      scale: newScale,
      position: newPosition,
    };
  }

  private poseSetters: { [K in BirdPose]: () => void } = {
    side: () => {
      this.setBodyBehind();
      this.setHeadFrame("towards");
      this.setBodyFrame("side");

      const { scale, position } = this.calculateTwoDimensionScalePosition(
        this.sideOffsets,
      );

      this.setScale(scale);
      this.setPosition(position);
    },
    front: () => {
      this.setBodyBehind();
      this.setHeadFrame("towards");
      this.setBodyFrame("towards");

      const { scale, yPosition } = this.calculateOneDimensionScalePosition(
        this.frontBackOffsets,
      );

      this.setScale(scale);
      this.setPosition({ y: yPosition });
    },
    back: () => {
      this.setHeadBehind();
      this.setHeadFrame("away");
      this.setBodyFrame("away");

      const { scale, yPosition } = this.calculateOneDimensionScalePosition(
        this.frontBackOffsets,
      );

      this.setScale(scale);
      this.setPosition({ y: yPosition });
    },
    moving: () => {
      this.setBodyBehind();
      this.setHeadFrame("side");
      this.setBodyFrame("move1");

      const { scale, position } = this.calculateTwoDimensionScalePosition(
        this.movingOffsets,
      );

      this.setScale(scale);
      this.setPosition(position);
    },
    soar: () => {
      this.setBodyBehind();
      this.setHeadFrame("soar");
      this.setBodyFrame("soar");

      const { scale, yPosition } = this.calculateOneDimensionScalePosition(
        this.soarOffsets,
      );

      this.setScale(scale);
      this.setPosition({ y: yPosition });
    },
  };

  setPose(pose: BirdPose) {
    this._pose = pose;
    if (pose === "side" || pose === "moving") {
      this.headMesh.x = this.headOffset.x;
    } else {
      this.headMesh.x = 0;
    }

    this.poseSetters[pose]();
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

  static oneDimensionalConfigOffsetsToLocal(
    configOffsets: OneDimensionalBirdConfigDimensionOffsets,
  ): OneDimensionalOffsets {
    return {
      head: configOffsets.head_offset * 100,
      foot: configOffsets.foot_offset * 100,
      centre: configOffsets.center_offset * 100,
      size: configOffsets.size_offset,
    };
  }
  static configPositionToLocal(position: BirdDimensionXY): Position {
    return {
      x: position.X * 100,
      y: position.Y * -100,
    };
  }
  static twoDimensionalConfigOffsetsToLocal(
    configOffsets: TwoDimensionalBirdConfigDimensionOffsets,
  ): TwoDimensionalOffsets {
    return {
      head: Bird.configPositionToLocal(configOffsets.head_offset),
      foot: Bird.configPositionToLocal(configOffsets.foot_offset),
      centre: Bird.configPositionToLocal(configOffsets.center_offset),
      size: configOffsets.size_offset,
    };
  }
}
