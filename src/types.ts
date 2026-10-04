interface BirdDimensionXY {
  X: number;
  Y: number;
}

interface BirdDimensionOffsets<Directions = BirdDimensionXY> {
  foot_offset: Directions;
  head_offset: Directions;
  center_offset: Directions;
  size_offset: number;
}

interface IDObject {
  id: string;
}

interface PathObject {
  path: string;
}

interface PerchPointWeights {
  perch_point: number;
  weight: number;
}

interface TimeWithVariance {
  base: number;
  variance: number;
}

interface RGB {
  red: number;
  green: number;
  blue: number;
}

interface BirdConfig {
  do_not_spawn: boolean;
  display_name: IDObject;
  description: IDObject;
  special_pose_name: IDObject;
  scientific_name: string;
  mockup_texture: PathObject;
  head_texture: PathObject;
  body_texture: PathObject;
  visuals_scene: PathObject;
  has_soaring_pose: boolean;
  visuals_config: {
    head_position_in_side_pose: {
      x: number;
      y: number;
    };
    body_position_y: number;
  };
  dimensions: {
    perched_front_back: {
      foot_offset: number;
      head_offset: number;
      center_offset: number;
      size_offset: number;
    };
    perched_side: BirdDimensionOffsets;
    flying_side: BirdDimensionOffsets;
    sideways: BirdDimensionOffsets;
    soaring: BirdDimensionOffsets<number>;
  };
  flap_animation_speed: number;
  tweet_sounds: PathObject[];
  flap_sound: PathObject;
  peck_sound: PathObject;
  rarity: number;
  preferred_biomes: number[];
  preferred_seeds: number[];
  supported_perch_points_weights: PerchPointWeights[];
  view_distance: number;
  stat_fly_speed: number;
  stat_ground_move_speed: number;
  stat_linger_time: TimeWithVariance;
  stat_migration_time: TimeWithVariance;
  stat_preferred_group_size: number;
  stat_tweet_wait_time: TimeWithVariance;
  stat_wander_time: TimeWithVariance;
  sex: 0 | 1 | 2;
  spawn_type: number;
  idle_animation: 0 | 1;
  bird_animation_override: [];
  movement_type: 0 | 1;
  should_sink_when_flying: boolean;
  move_head_when_tweeting: boolean;
  visuals_scale_factor: number;
  whistle_colors: RGB[];
  config_info: {
    config_instance_id: number;
    config_type_id: "BirdSpecies";
  };
}
