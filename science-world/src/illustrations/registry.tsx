import { useState, type ComponentType } from 'react';
import type { Scene, Visual } from '../data/types';
import { assetReady } from '../data/assets';
import { BodyArt, BrainArt, DigestiveArt, HeartArt, KidneysArt, LungsArt, type ArtProps } from './body';
import { AcidRainArt, ForestArt, PhotosynthesisArt, PollutionArt } from './environment';
import { DissolveArt, FilterArt, IceCycleArt, MatchArt, MixturesArt, SandFilterArt, SieveArt } from './matter';

/**
 * Every hand-drawn illustration, by key. Lesson data refers to these keys.
 * Frames (for "process" steps) are documented next to each component.
 */
export const artRegistry: Record<string, ComponentType<ArtProps>> = {
  body: BodyArt,
  heart: HeartArt,
  lungs: LungsArt,
  digestive: DigestiveArt,
  kidneys: KidneysArt,
  brain: BrainArt,
  photosynthesis: PhotosynthesisArt,
  acidRain: AcidRainArt,
  forest: ForestArt,
  pollution: PollutionArt,
  iceCycle: IceCycleArt,
  match: MatchArt,
  sieve: SieveArt,
  filter: FilterArt,
  sandFilter: SandFilterArt,
  dissolve: DissolveArt,
  mixtures: MixturesArt,
};

export function Art({ name, frame, highlight }: { name: string; frame?: number; highlight?: string }) {
  const C = artRegistry[name];
  if (!C) return <div className="art art--missing">🖼️</div>;
  return <C frame={frame} highlight={highlight} />;
}

export function SceneView({ scene, active }: { scene: Scene; active?: number }) {
  return (
    <div className={`scene scene--${scene.bg}`} role="img" aria-label={scene.items.map((i) => i.label).filter(Boolean).join('، ')}>
      {scene.items.map((it, i) => (
        <span
          key={i}
          className={`scene__item ${active === i ? 'scene__item--on' : ''}`}
          style={{ insetInlineStart: undefined, left: `${it.x}%`, top: `${it.y}%`, fontSize: `${(it.size ?? 1) * 2.6}rem`, animationDelay: `${(i % 5) * 0.4}s` }}
          aria-hidden="true"
        >
          {it.emoji}
        </span>
      ))}
    </div>
  );
}

/**
 * Renders a lesson visual. If an AI-generated `asset` exists it is shown;
 * if the file is missing (not generated yet) we fall back to the SVG art or emoji.
 */
export function VisualView({ visual, className = '' }: { visual: Visual; className?: string }) {
  const [assetFailed, setAssetFailed] = useState(false);
  if (assetReady(visual.asset) && !assetFailed) {
    return (
      <img
        className={`visual visual--img ${className}`}
        src={visual.asset}
        alt={visual.alt}
        loading="lazy"
        decoding="async"
        onError={() => setAssetFailed(true)}
      />
    );
  }
  if (visual.art) {
    return (
      <div className={`visual ${className}`}>
        <Art name={visual.art} />
      </div>
    );
  }
  return (
    <div className={`visual visual--emoji ${className}`} role="img" aria-label={visual.alt}>
      <span aria-hidden="true">{visual.emoji ?? '🔬'}</span>
    </div>
  );
}
