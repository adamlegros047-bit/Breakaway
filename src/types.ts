
export type Suit = 'Helmet' | 'Skate' | 'Stick' | 'Glove';

export type ActionType = 
  | 'Intercept' 
  | 'Deflect' 
  | 'Tip' 
  | 'Stretch Pass' 
  | 'Save' 
  | 'Body-Check' 
  | 'Poke-check' 
  | 'Punch' 
  | 'On-Net' 
  | 'Score' 
  | 'Move' 
  | 'Substitution' 
  | 'Shoot' 
  | 'Icing' 
  | 'Block' 
  | 'Clone' 
  | 'Draw';

export type AbilityColor = 
  | 'Black' 
  | 'Blue' 
  | 'Bronze' 
  | 'Brown' 
  | 'Gold' 
  | 'Green' 
  | 'Orange' 
  | 'Purple' 
  | 'Red' 
  | 'Silver' 
  | 'Yellow' 
  | 'Pink';

export type Area = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export type Zone = 'Defensive' | 'Neutral' | 'Offensive';

export interface Card {
  id: string;
  name: string;
  number?: number; // 0-8 or goalie
  isGoalie?: boolean;
  suits: Suit[];
  actions: ActionType[];
  abilities: AbilityColor[];
  specials: string[];
  drawbacks?: string[];
  points: number; // For bench limit (total 85)
  symbol?: string; // e.g. "Colored #", "Dot", "O", "D", "N", "H", "A", "X", "K", "0", "P"
  restriction?: 'I' | 'II';
  sprite?: { sheet: 1 | 2; x: number; y: number };
  image?: string;
}

export interface PlayerState {
  id: string;
  name: string;
  hand: Card[];
  deck: Card[];
  discard: Card[];
  bench: Card[];
  score: number;
  momentumTokens: number;
  momentumHand: Card[]; // Momentum cards drawn
  isHome: boolean;
  maxHandSize: number;
  preFaceoffSwaps: number;
  momentumBonus: number;
}

export interface GameState {
  home: PlayerState;
  away: PlayerState;
  puck: {
    area: Area;
    side: 'home' | 'away' | 'neutral';
    possession: 'home' | 'away' | null;
  };
  currentPeriod: 1 | 2 | 3 | 'OT' | 'Shootout';
  turn: 'home' | 'away';
  phase: 1 | 2 | 3 | 4;
  momentumCards: Card[];
  officiatingCard: Card | null;
  passingBonusMap: { home: number; away: number };
  activeChallenge: Challenge | null;
  activeCards: Card[];
  lastShotCard: Card | null;
  pendingPerk: PendingPerk | null;
  isFinalMinute: boolean;
  stoppage: boolean;
  logs: string[];
}

export interface PendingPerk {
  winner: 'home' | 'away';
  card: Card;
  selectedAction?: ActionType;
  selectedAbility?: AbilityColor;
}

export interface Challenge {
  type: 'Face-off' | 'Grind' | 'DumpChase' | 'DumpOut' | 'Fight' | 'Shot';
  initiator: 'home' | 'away';
  area: Area;
  homeCard: Card | null;
  awayCard: Card | null;
  status: 'pending' | 'resolved';
}
