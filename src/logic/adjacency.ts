import type { Area } from '../types';

// All valid area keys in the format "side-area"
// Adjacency defines which areas can be moved to from any given position
export const ADJACENCY: Record<string, string[]> = {
  // === NEUTRAL ZONE ===
  // Centre face-off
  'neutral-9': ['neutral-10', 'neutral-11', 'neutral-6', 'neutral-7', 'neutral-8', 'neutral-12'],
  // Upper row (closer to offensive)
  'neutral-10': ['neutral-9', 'neutral-6', 'neutral-7', 'away-1', 'away-2'],
  'neutral-6':  ['neutral-9', 'neutral-10', 'neutral-8', 'away-2', 'away-4'],
  'neutral-7':  ['neutral-9', 'neutral-10', 'neutral-12', 'away-1', 'away-3'],
  // Lower row (closer to defensive)
  'neutral-11': ['neutral-9', 'neutral-8', 'neutral-12', 'home-1', 'home-2'],
  'neutral-8':  ['neutral-9', 'neutral-11', 'neutral-6', 'home-2', 'home-4'],
  'neutral-12': ['neutral-9', 'neutral-11', 'neutral-7', 'home-1', 'home-3'],

  // === OFFENSIVE ZONE (away side) ===
  // Blue line / entry
  'away-1':  ['neutral-10', 'neutral-7', 'away-3', 'away-0'],
  'away-2':  ['neutral-10', 'neutral-6', 'away-4', 'away-12'],
  'away-3':  ['away-1', 'away-0'],
  'away-4':  ['away-2', 'away-12'],
  // Face-off circles
  'away-0':  ['away-1', 'away-3', 'away-8'],   // right face-off
  'away-12': ['away-2', 'away-4', 'away-8'],   // left face-off
  // Crease / slot
  'away-8':  ['away-0', 'away-12', 'away-7', 'away-5', 'away-6'],
  // Behind net
  'away-7':  ['away-8', 'away-5', 'away-6'],   // center behind net
  'away-5':  ['away-7', 'away-8'],              // right behind net
  'away-6':  ['away-7', 'away-8'],              // left behind net

  // === DEFENSIVE ZONE (home side) ===
  // Blue line / entry
  'home-1':  ['neutral-11', 'neutral-12', 'home-3', 'home-0'],
  'home-2':  ['neutral-11', 'neutral-8', 'home-4', 'home-12'],
  'home-3':  ['home-1', 'home-0'],
  'home-4':  ['home-2', 'home-12'],
  // Face-off circles
  'home-0':  ['home-1', 'home-3', 'home-8'],   // right face-off
  'home-12': ['home-2', 'home-4', 'home-8'],   // left face-off
  // Crease / slot
  'home-8':  ['home-0', 'home-12', 'home-7', 'home-5', 'home-6'],
  // Behind net
  'home-7':  ['home-8', 'home-5', 'home-6'],   // center behind net
  'home-5':  ['home-7', 'home-8'],              // right behind net
  'home-6':  ['home-7', 'home-8'],              // left behind net
};

export type PuckLocation = { area: Area; side: 'home' | 'away' | 'neutral' };

export const getAdjacentAreas = (area: Area, side: 'home' | 'away' | 'neutral'): string[] => {
  const key = `${side}-${area}`;
  return ADJACENCY[key] ?? [];
};
