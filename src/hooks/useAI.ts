import { useEffect, useRef } from 'react';
import type { GameState, Area } from '../types';

interface AIControls {
  playCard: (player: 'home' | 'away', cardId: string) => void;
  endTurn: () => void;
  movePuckTo: (area: Area, side: 'home' | 'away' | 'neutral') => void;
}

export const useAI = (state: GameState, controls: AIControls, isEnabled: boolean) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isEnabled || state.currentPeriod === 'OT' /* Expand later if needed */) return;

    // Clear any pending timeouts on state change so we don't double loop
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const awayHand = state.away.hand;
    if (awayHand.length === 0) return; // Nothing we can do securely without cards

    const aiThinkingDelay = 1800; // 1.8 seconds feeling of "thought"

    // 1. Resolve Active Challenge
    if (state.activeChallenge && state.activeChallenge.awayCard === null) {
      timeoutRef.current = setTimeout(() => {
        let chosenCard = awayHand[0];

        // Basic heuristics
        if (state.activeChallenge!.type === 'Face-off') {
          // Play highest value card to win faceoff
          chosenCard = [...awayHand].sort((a, b) => (b.number || 0) - (a.number || 0))[0];
        } else if (state.activeChallenge!.type === 'Shot' && state.activeChallenge!.initiator === 'home') {
          // We are defending a shot - look for a 'Save' action card, else highest number
          const saveCard = awayHand.find(c => c.actions.includes('Save'));
          if (saveCard) {
            chosenCard = saveCard;
          } else {
            chosenCard = [...awayHand].sort((a, b) => (b.number || 0) - (a.number || 0))[0];
          }
        } else {
          // Play highest value card by default
          chosenCard = [...awayHand].sort((a, b) => (b.number || 0) - (a.number || 0))[0];
        }

        controls.playCard('away', chosenCard.id);
      }, aiThinkingDelay);
      return;
    }

    // 2. Play General Turn (Phase 1, 3, or simply when it's our turn and no active challenge)
    if (state.turn === 'away' && !state.activeChallenge && !state.stoppage) {
      // In Breakaway, phase 3 is the typical "post-play" before endTurn, 
      // but if activeCards is empty, we haven't played our card yet for this turn.
      if (state.activeCards.filter(c => state.away.discard.find(d => d.id === c.id)).length === 0) {
        
        timeoutRef.current = setTimeout(() => {
          // Determine Zone Actions
          const hasPos = state.puck.possession === 'away';
          let chosenCard = awayHand[0];

          if (hasPos) {
             // If we have possession, check if we want to Shoot (offensive zone)
             // Away targets Home zone. So if puck side is 'home', we are in Offensive Zone.
             const isOffensive = state.puck.side === 'home';
             const shootCard = awayHand.find(c => c.actions.includes('Shoot') || c.actions.includes('Score'));
             
             if (isOffensive && shootCard) {
               chosenCard = shootCard;
             } else {
               // Play a Pass, Skate or Move card to advance puck
               const moveCard = awayHand.find(c => c.actions.includes('Move') || c.name === 'Skating' || c.name === 'Passing');
               chosenCard = moveCard || awayHand[Math.floor(Math.random() * awayHand.length)];
             }
          } else {
            // Defending - play a Body-Check, Poke-check or Defensive card
            const defenseCard = awayHand.find(c => c.actions.includes('Body-Check') || c.actions.includes('Poke-check') || c.actions.includes('Deflect'));
            chosenCard = defenseCard || awayHand[Math.floor(Math.random() * awayHand.length)];
          }

          controls.playCard('away', chosenCard.id);
          
          // Optionally move puck immediately after playing a move card (simplified logic)
          if (chosenCard.actions.includes('Move') || chosenCard.name === 'Skating') {
             // Just advance puck arbitrarily closer to Home zone (downwards)
             setTimeout(() => {
               const targetSide = state.puck.side === 'away' ? 'neutral' : 'home';
               controls.movePuckTo(state.puck.area, targetSide);
             }, 800);
          }

          // Automatically end turn afterwards
          setTimeout(() => {
            controls.endTurn();
          }, 1600);

        }, aiThinkingDelay);
      }
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [state, controls, isEnabled]);
};
