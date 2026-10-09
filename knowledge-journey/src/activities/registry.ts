import type { ComponentType } from 'react';
import type { ActivityProps } from '../components/ActivityShell';
import type { ActivityId } from '../lib/types';
import { Chests } from './Chests';
import { Cinema } from './Cinema';
import { Crown } from './Crown';
import { Detective } from './Detective';
import { Gates } from './Gates';
import { Lightning } from './Lightning';
import { Puzzle } from './Puzzle';
import { Wheel } from './Wheel';

export const ACTIVITY_COMPONENTS: Record<ActivityId, ComponentType<ActivityProps>> = {
  gates: Gates,
  chests: Chests,
  wheel: Wheel,
  detective: Detective,
  puzzle: Puzzle,
  cinema: Cinema,
  lightning: Lightning,
  crown: Crown,
};
