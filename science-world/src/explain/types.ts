/**
 * «الشرح المتحرك» — animated explainers, written as data.
 *
 * An explainer is a short series of scenes. Each scene is a stage (16:10) with "actors"
 * (emoji, labels, diagrams, arrows, particles flowing along a path, counters…) that
 * appear and move on a timeline, plus one or two sentences of narration under the stage.
 * Coordinates are percentages of the stage: x 0 → 100 (left → right), y 0 → 100 (top → bottom).
 * Times are seconds from the start of the scene.
 */
import type { MathVisual } from '../data/types';

export type XY = [number, number];

/** A change at a moment in time: move / grow / fade… and/or a looping effect. */
export interface Anim {
  /** seconds from the start of the scene */
  at: number;
  /** new position/scale/rotation/opacity reached at `at + dur` */
  to?: { x?: number; y?: number; scale?: number; rotate?: number; opacity?: number };
  /** how long the move takes (default 0.8 s) */
  dur?: number;
  /** a looping or one-shot effect starting at `at` */
  effect?: 'pulse' | 'beat' | 'shake' | 'bounce' | 'spin' | 'glow' | 'wiggle' | 'float' | 'none';
}

interface ActorBase {
  id: string;
  /** time it appears (default 0); appears with a soft pop */
  in?: number;
  /** time it disappears (optional) */
  out?: number;
  anim?: Anim[];
}

export interface EmojiActor extends ActorBase {
  kind: 'emoji';
  emoji: string;
  x: number;
  y: number;
  /** size in % of stage width (default 10) */
  size?: number;
}

export interface TextActor extends ActorBase {
  kind: 'text';
  text: string;
  x: number;
  y: number;
  /** font size in % of stage width (default 4) */
  size?: number;
  /** a token like 'accent' | 'good' | 'bad' | 'ink' | 'sun' or a CSS colour */
  color?: string;
  /** label bubble (white rounded box) */
  box?: boolean;
  /** maths / English that must be read left-to-right */
  ltr?: boolean;
}

export interface ArtActor extends ActorBase {
  kind: 'art';
  /** key in illustrations/registry.tsx (body, heart, lungs, digestive, kidneys, brain, photosynthesis, …) */
  art: string;
  highlight?: string;
  frame?: number;
  x: number;
  y: number;
  /** width in % of stage width */
  w: number;
}

export interface MathActor extends ActorBase {
  kind: 'math';
  math: MathVisual;
  x: number;
  y: number;
  w: number;
}

/** A simple coloured shape (container, organ blob, cup, box, table cell…). */
export interface ShapeActor extends ActorBase {
  kind: 'shape';
  shape: 'circle' | 'rect' | 'pill';
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  label?: string;
  /** outline only */
  outline?: boolean;
}

/** An arrow that draws itself from → to (optionally curved). */
export interface ArrowActor extends ActorBase {
  kind: 'arrow';
  from: XY;
  to: XY;
  /** bend: positive curves one way, negative the other (in % of stage) */
  curve?: number;
  color?: string;
  dashed?: boolean;
  label?: string;
}

/** Things travelling along a path again and again (blood cells, air, food, electricity…). */
export interface FlowActor extends ActorBase {
  kind: 'flow';
  path: XY[];
  /** what travels: an emoji, or nothing for coloured dots */
  emoji?: string;
  color?: string;
  /** how many travellers (default 4) */
  count?: number;
  /** seconds for one trip (default 4) */
  speed?: number;
  /** draw the path as a faint line */
  showPath?: boolean;
  /** smooth curve through the points (default true) */
  smooth?: boolean;
}

/** A number that counts from → to (pulse, breaths, totals…). */
export interface CounterActor extends ActorBase {
  kind: 'counter';
  from: number;
  to: number;
  x: number;
  y: number;
  /** seconds to count (default 2) */
  dur?: number;
  size?: number;
  prefix?: string;
  suffix?: string;
  /** Arabic-Indic digits (default true) */
  arabic?: boolean;
  decimals?: number;
}

export type Actor = EmojiActor | TextActor | ArtActor | MathActor | ShapeActor | ArrowActor | FlowActor | CounterActor;

export type StageBg = 'sky' | 'body' | 'lab' | 'sea' | 'garden' | 'board' | 'night' | 'paper' | 'desert' | 'city';

export interface Scene {
  /** small heading shown on the stage, e.g. «القلب مضخّة» */
  title?: string;
  /** narration under the stage (Arabic for science/math; English lessons may use English + `sayAr`) */
  say: string;
  /** optional Arabic version for English lessons */
  sayAr?: string;
  /** seconds (default: long enough to read `say`, min 6) */
  duration?: number;
  bg?: StageBg;
  actors: Actor[];
}

export interface Explainer {
  /** lesson id, e.g. "1-2", "m1-1", "e1-3" */
  lesson: string;
  title: string;
  scenes: Scene[];
}
