import type { ActionType, AbilityColor } from '../types';

/**
 * Maps each ability colour to the actions it automatically grants
 * when a card carrying that colour is played.
 * These actions do NOT need to be selected in the card play prompt —
 * they are always available and auto-queued into the resolution sequence.
 */
export const COLOR_ACTIONS: Partial<Record<AbilityColor, ActionType[]>> = {
  Blue:   ['On-Net', 'Score'],
  Brown:  ['Body-Check'],
  Orange: ['Move'],             // Finesse = free Move
  Gold:   ['Block', 'Stretch Pass'],
  Green:  ['Block', 'Clone'],
  Pink:   ['Draw'],
  Purple: ['Doubles'],
  Black:  ['Stoppage'],
  Yellow: ['Grind Challenge'],
  // Red, Silver, Bronze:
  // effects are situational / require game-level challenge logic — handled separately
};
