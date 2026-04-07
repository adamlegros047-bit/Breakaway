import type { Card } from './types';

export const OFFICIAL_CARDS: Card[] = [
  // ROW 1
  { id: 'block-1', name: 'Block', number: 12, suits: ['Stick'], actions: ['Block'], abilities: ['Green'], specials: [], points: 12, image: '/cards/Block.png' },
  { id: 'timeout-1', name: 'Timeout', suits: ['Helmet'], actions: [], abilities: [], specials: [], points: 5, restriction: 'I', sprite: { sheet: 1, x: 2, y: 0 } },
  { id: 'miss-1', name: 'Miss', suits: [], actions: [], abilities: [], specials: [], points: 0, image: '/cards/Miss.png' },
  { id: 'referee-1', name: 'Referee', suits: [], actions: [], abilities: [], specials: [], points: 10, restriction: 'II', image: '/cards/Official.png' },
  { id: 'linesman-1', name: 'Linesman', suits: [], actions: [], abilities: [], specials: [], points: 10, restriction: 'II', image: '/cards/Linesman.png' },
  { id: 'bodycheck-1', name: 'Body Check', suits: ['Skate'], actions: ['Body-Check'], abilities: ['Brown'], specials: [], points: 10, sprite: { sheet: 1, x: 6, y: 0 } },
  { id: 'breakaway-1', name: 'Breakaway', suits: ['Skate'], actions: [], abilities: ['Orange'], specials: [], points: 15, sprite: { sheet: 1, x: 8, y: 0 } },
  { id: 'elbow-1', name: 'Elbow', suits: ['Glove'], actions: [], abilities: [], specials: ['P'], points: 5, sprite: { sheet: 1, x: 9, y: 0 } },
  
  // ROW 2
  { id: 'deflection-1', name: 'Deflection', number: 4, suits: ['Stick'], actions: ['Deflect'], abilities: ['Red'], specials: [], points: 10, image: '/cards/Deflection.png' },
  { id: 'stickhandling-1', name: 'Stick Handling', number: 0, suits: ['Stick'], actions: ['Tip'], abilities: ['Red'], specials: [], points: 10, sprite: { sheet: 1, x: 9, y: 1 } },
  
  // ROW 3
  { id: 'rookie-1', name: 'Rookie', number: 1, suits: ['Skate'], actions: ['Move'], abilities: [], specials: [], points: 10, sprite: { sheet: 1, x: 1, y: 2 } },
  { id: 'specialist-1', name: 'Specialist', number: 2, suits: ['Helmet'], actions: [], abilities: ['Blue'], specials: [], points: 15, sprite: { sheet: 1, x: 3, y: 2 } },
  { id: 'enforcer-1', name: 'Enforcer', number: 3, suits: ['Glove'], actions: ['Punch'], abilities: ['Brown'], specials: [], points: 15, sprite: { sheet: 1, x: 5, y: 2 } },
  { id: 'sniper-1', name: 'Sniper', number: 4, suits: ['Stick'], actions: ['Shoot'], abilities: ['Blue'], specials: [], points: 20, sprite: { sheet: 1, x: 7, y: 2 } },
  { id: 'winger-1', name: 'Winger', number: 5, suits: ['Skate'], actions: ['Move'], abilities: [], specials: [], points: 15, sprite: { sheet: 1, x: 9, y: 2 } },

  // ROW 4
  { id: 'centre-1', name: 'Centre', number: 6, suits: ['Stick'], actions: ['Move'], abilities: [], specials: [], points: 15, sprite: { sheet: 1, x: 1, y: 3 } },
  { id: 'defenceman-1', name: 'Defenceman', number: 7, suits: ['Helmet'], actions: ['Intercept'], abilities: [], specials: [], points: 15, sprite: { sheet: 1, x: 3, y: 3 } },
  { id: 'linechange-1', name: 'Line Change', number: 8, suits: ['Skate'], actions: ['Substitution'], abilities: ['Pink'], specials: [], points: 10, image: '/cards/Linechange.png' },
  { id: 'superstar-1', name: 'Superstar', number: 8, suits: ['Stick', 'Glove'], actions: [], abilities: ['Purple'], specials: [], points: 30, sprite: { sheet: 1, x: 7, y: 3 } },
  { id: 'passing-1', name: 'Passing', number: 9, suits: ['Stick'], actions: ['Move'], abilities: ['Yellow'], specials: [], points: 20, sprite: { sheet: 1, x: 9, y: 3 } },

  // ROW 5
  { id: 'skating-1', name: 'Skating', number: 10, suits: ['Skate'], actions: ['Move'], abilities: ['Yellow'], specials: [], points: 10, sprite: { sheet: 1, x: 1, y: 4 } },
  { id: 'playmaking-1', name: 'Playmaking', number: 11, suits: ['Stick'], actions: ['Move'], abilities: ['Yellow'], specials: [], points: 10, sprite: { sheet: 1, x: 3, y: 4 } },
  { id: 'coaching-1', name: 'Coaching', number: 12, suits: ['Helmet'], actions: [], abilities: ['Gold'], specials: [], points: 12, sprite: { sheet: 1, x: 5, y: 4 } },

  // ROW 6
  { id: 'goalie-1', name: 'Goalie', number: 12, isGoalie: true, suits: ['Glove'], actions: ['Save', 'Block'], abilities: ['Red'], specials: [], points: 25, sprite: { sheet: 1, x: 3, y: 5 } },
  { id: 'penaltykill-1', name: 'Penalty Kill', number: 12, suits: ['Helmet'], actions: [], abilities: [], specials: ['K'], points: 10, sprite: { sheet: 1, x: 0, y: 5 } },
  { id: 'score-1', name: 'Score!', number: 14, suits: ['Stick'], actions: ['Score'], abilities: ['Blue'], specials: [], points: 20, sprite: { sheet: 1, x: 4, y: 5 } },
  { id: 'powerplay-1', name: 'Power Play', number: 15, suits: ['Stick'], actions: [], abilities: ['Purple'], specials: [], points: 20, sprite: { sheet: 1, x: 9, y: 5 } },
  
  // NEW CARDS FROM USER LIST
  { id: 'pokecheck-1', name: 'Poke Check', number: 3, suits: ['Stick'], actions: ['Poke-check'], abilities: ['Green'], specials: [], points: 10, sprite: { sheet: 2, x: 0, y: 0 } },
  { id: 'utility-faceoff', name: 'Faceoff Utility', suits: ['Helmet'], actions: [], abilities: ['Gold'], specials: ['U'], points: 15, image: '/cards/Face-off.png' },
  { id: 'utility-finesse', name: 'Finesse Utility', suits: ['Skate'], actions: [], abilities: ['Pink'], specials: ['U'], points: 15, image: '/cards/Finesse.png' },
  { id: 'utility-elite', name: 'Elite Utility', suits: ['Stick'], actions: [], abilities: ['Gold'], specials: ['U'], points: 20, image: '/cards/Elite.png' },
  { id: 'utility-plain', name: 'Utility', suits: ['Glove'], actions: [], abilities: [], specials: ['U'], points: 10, sprite: { sheet: 2, x: 4, y: 0 } },
  { id: 'rush-9', name: 'Rush 9', number: 9, suits: ['Skate'], actions: ['Move'], abilities: ['Orange'], specials: [], points: 12, sprite: { sheet: 2, x: 5, y: 0 } },
  { id: 'rush-10', name: 'Rush 10', number: 10, suits: ['Skate'], actions: ['Move'], abilities: ['Orange'], specials: [], points: 15, sprite: { sheet: 2, x: 6, y: 0 } },
  { id: 'shoot-puck', name: 'Shoot the Puck', number: 6, suits: ['Stick'], actions: ['Shoot'], abilities: ['Blue'], specials: [], points: 20, sprite: { sheet: 2, x: 7, y: 0 } },
  { id: 'goal', name: 'Goal', number: 0, suits: [], actions: ['Score'], abilities: ['Gold'], specials: [], points: 50, sprite: { sheet: 2, x: 8, y: 0 } },
  { id: 'crowd', name: 'Crowd', suits: [], actions: [], abilities: ['Yellow'], specials: ['C'], points: 5, image: '/cards/Crowd.png' },
];

export const FULL_DECK: Card[] = [...OFFICIAL_CARDS, ...OFFICIAL_CARDS, ...OFFICIAL_CARDS].slice(0, 60);

export const getOfficialDeck = (playerPrefix: string): Card[] => {
  const find = (name: string) => OFFICIAL_CARDS.find(c => c.name.toLowerCase() === name.toLowerCase());
  
  const deckConfig: { [name: string]: number } = {
    'Timeout': 1, 'Miss': 1, 'Referee': 1, 'Linesman': 1,
    'Body Check': 2, 'Elbow': 2,
    'Breakaway': 1,
    'Deflection': 2,
    'Faceoff Utility': 1, 'Utility': 1, 'Finesse Utility': 1, 'Elite Utility': 1,
    'Poke Check': 2, 'Stick Handling': 2,
    'Rookie': 2, 'Specialist': 2, 'Enforcer': 2, 'Sniper': 2, 'Winger': 2, 'Centre': 2, 'Defenceman': 2, 'Superstar': 2,
    'Line Change': 2,
    'Passing': 2, 'Skating': 2, 'Playmaking': 2,
    'Rush 9': 1, 'Rush 10': 1,
    'Block': 2, 'Coaching': 2, 'Goalie': 2, 'Penalty Kill': 2, 'Power Play': 2,
    'Shoot the Puck': 2, 'Score!': 2, 'Goal': 2,
    'Crowd': 1
  };

  const deck: Card[] = [];
  Object.entries(deckConfig).forEach(([name, count]) => {
    const template = find(name);
    if (template) {
      for (let i = 0; i < count; i++) {
        let card = { ...template, id: `${template.id}-${playerPrefix}-${i}` };
        
        // Specific Art Overrides for Black Deck
        if (playerPrefix === 'black' && name === 'Body Check') {
          if (i === 0) card.image = '/cards/bodycheckskate.png';
          if (i === 1) card.image = '/cards/bodycheckstick.png';
          card.abilities = ['Brown']; // Ensure it's brown
          card.actions = ['Body-Check'];
        }

        if (playerPrefix === 'black' && name === 'Defenceman') {
          if (i === 0) card.image = '/cards/Defenceglove.png';
          if (i === 1) card.image = '/cards/Defencestick.png';
        }

        if (playerPrefix === 'black' && name === 'Centre') {
          if (i === 0) card.image = '/cards/Centrehelm.png';
          if (i === 1) card.image = '/cards/Centrestick.png';
        }

        if (playerPrefix === 'black' && name === 'Coaching') {
          if (i === 0) card.image = '/cards/Coachinghelm.png';
          if (i === 1) card.image = '/cards/Coachingstick.png';
        }

        if (playerPrefix === 'black' && name === 'Enforcer') {
          if (i === 0) card.image = '/cards/Enforcerglove.png';
          if (i === 1) card.image = '/cards/Enforcerskate.png';
        }

        if (playerPrefix === 'black' && name === 'Goal') {
          if (i === 0) card.image = '/cards/Goalglove.png';
          if (i === 1) card.image = '/cards/Goalhelm.png';
        }

        if (playerPrefix === 'white' && name === 'Body Check') {
          if (i === 0) card.image = '/cards/Bodycheckglove.png';
          if (i === 1) card.image = '/cards/Bodycheckhelm.png';
        }

        // Specific Art Overrides for White Deck
        if (playerPrefix === 'white' && name === 'Poke Check') {
          if (i === 0) card.image = '/cards/Pokeglove.png';
          if (i === 1) card.image = '/cards/Pokehelmet.png';
        }

        if (playerPrefix === 'white' && name === 'Defenceman') {
          if (i === 0) card.image = '/cards/Defencehelm.png';
          if (i === 1) card.image = '/cards/Defenceskate.png';
        }

        if (playerPrefix === 'white' && name === 'Rush 9') {
          card.image = '/cards/3on1.png';
        }

        if (playerPrefix === 'white' && name === 'Centre') {
          if (i === 0) card.image = '/cards/Centreglove.png';
          if (i === 1) card.image = '/cards/Centreskate.png';
        }

        if (playerPrefix === 'white' && name === 'Coaching') {
          if (i === 0) card.image = '/cards/Coachingglove.png';
          if (i === 1) card.image = '/cards/Coachingskate.png';
        }

        if (playerPrefix === 'white' && name === 'Enforcer') {
          if (i === 0) card.image = '/cards/Enforcerhelm.png';
          if (i === 1) card.image = '/cards/Enforcerstick.png';
        }

        if (playerPrefix === 'white' && name === 'Goal') {
          if (i === 0) card.image = '/cards/Goalstick.png';
          if (i === 1) card.image = '/cards/Goalskate.png';
        }

        deck.push(card);
      }
    }
  });

  return deck;
};

export const shuffle = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
