import type { Card } from './types';

export const OFFICIAL_CARDS: Card[] = [
  // ROW 1
  { id: 'block-1', name: 'Block', number: 12, suits: ['Stick'], actions: ['Block'], abilities: ['Green'], specials: [], points: 12, image: '/cards/Block.png' },
  { id: 'timeout-1', name: 'Timeout', suits: ['Helmet'], actions: [], abilities: ['Black'], specials: ['Timeout'], points: 5, restriction: 'I', image: '/cards/Timeout.png' },
  { id: 'miss-1', name: 'Miss', suits: [], actions: [], abilities: ['Green'], specials: ['You Missed'], points: 0, image: '/cards/Miss.png' },
  { id: 'referee-1', name: 'Referee', suits: [], actions: [], abilities: ['Black'], specials: [], drawbacks: ['Game Misconduct on abuse'], points: 10, restriction: 'II', image: '/cards/Official.png' },
  { id: 'linesman-1', name: 'Linesman', suits: [], actions: [], abilities: ['Black'], specials: [], points: 10, restriction: 'II', image: '/cards/Linesman.png' },
  { id: 'bodycheck-1', name: 'Body Check', suits: ['Skate'], actions: ['Body-Check'], abilities: ['Brown'], specials: [], points: 10, sprite: { sheet: 1, x: 6, y: 0 } },
  { id: 'breakaway-1', name: 'Breakaway', suits: ['Helmet', 'Skate', 'Glove', 'Stick'], actions: [], abilities: ['Orange'], specials: ['Breakaway'], points: 15, image: '/cards/Breakaway.png' },
  { id: 'elbow-1', name: 'Elbow', suits: ['Glove'], actions: ['Punch'], abilities: [], specials: ['P'], points: 5, image: '/cards/Punchhelmet.png' },
  
  // ROW 2
  { id: 'deflection-1', name: 'Deflection', number: 4, suits: ['Stick'], actions: ['Deflect'], abilities: ['Red'], specials: [], points: 10, image: '/cards/Deflection.png' },
  { id: 'stickhandling-1', name: 'Stick Handling', number: 0, suits: ['Stick'], actions: ['Tip'], abilities: ['Red'], specials: [], points: 10, image: '/cards/Stickhandle0.png' },
  
  // ROW 3
  { id: 'rookie-1', name: 'Rookie', number: 1, suits: ['Skate'], actions: [], abilities: ['Red'], specials: [], drawbacks: ['-2 Power vs Veterans'], points: 10, image: '/cards/Rookiehelm.png' },
  { id: 'specialist-1', name: 'Specialist', number: 2, suits: ['Helmet'], actions: [], abilities: ['Red'], specials: [], points: 15, image: '/cards/Specialiststick.png' },
  { id: 'enforcer-1', name: 'Enforcer', number: 3, suits: ['Glove'], actions: [], abilities: ['Red'], specials: [], drawbacks: ['2-Min High Sticking Chance'], points: 15, image: '/cards/Enforcerglove.png' },
  { id: 'sniper-1', name: 'Sniper', number: 4, suits: ['Stick'], actions: [], abilities: ['Red'], specials: [], points: 20, image: '/cards/Sniperhelm.png' },
  { id: 'winger-1', name: 'Winger', number: 5, suits: ['Skate'], actions: [], abilities: ['Red'], specials: [], points: 15, image: '/cards/Wingerglove.png' },

  // ROW 4
  { id: 'centre-1', name: 'Centre', number: 6, suits: ['Stick'], actions: [], abilities: ['Red'], specials: [], points: 15, image: '/cards/Centrehelm.png' },
  { id: 'defenceman-1', name: 'Defenceman', number: 7, suits: ['Helmet'], actions: [], abilities: ['Red'], specials: [], points: 15, image: '/cards/Defencestick.png' },
  { id: 'linechange-1', name: 'Line Change', number: 8, suits: ['Skate'], actions: ['Substitution'], abilities: ['Pink'], specials: [], points: 10, image: '/cards/Linechange.png' },
  { id: 'superstar-1', name: 'Superstar', number: 8, suits: ['Stick', 'Glove'], actions: ['Move'], abilities: ['Orange', 'Blue'], specials: ['Dig it Out'], points: 30, image: '/cards/Superstarhelm.png' },
  { id: 'passing-1', name: 'Passing', number: 9, suits: ['Stick'], actions: ['Move'], abilities: ['Yellow'], specials: [], points: 20, image: '/cards/Passingskate.png' },

  // ROW 5
  { id: 'skating-1', name: 'Skating', number: 10, suits: ['Skate'], actions: ['Move'], abilities: ['Yellow'], specials: [], points: 10, image: '/cards/Skatingglove.png' },
  { id: 'playmaking-1', name: 'Playmaking', number: 11, suits: ['Stick'], actions: ['Move'], abilities: ['Yellow'], specials: [], points: 10, image: '/cards/Playmakinghelm.png' },
  { id: 'coaching-1', name: 'Coaching', number: 12, suits: ['Helmet'], actions: [], abilities: ['Gold'], specials: [], points: 12, image: '/cards/Coachinghelm.png' },

  // ROW 6
  { id: 'goalie-1', name: 'Goalie', number: 12, isGoalie: true, suits: ['Glove'], actions: ['Save', 'Block'], abilities: ['Red'], specials: [], points: 25, image: '/cards/Goalieskate.png' },
  { id: 'penaltykill-1', name: 'Penalty Kill', number: 12, suits: ['Helmet'], actions: [], abilities: ['Orange'], specials: ['K'], points: 10, image: '/cards/Penaltykill.png' },
  { id: 'score-1', name: 'Score!', number: 14, suits: ['Stick'], actions: ['Move', 'Score'], abilities: ['Blue'], specials: [], points: 20, image: '/cards/Score.png' },
  { id: 'powerplay-1', name: 'Power Play', number: 15, suits: ['Helmet', 'Skate', 'Glove', 'Stick'], actions: [], abilities: ['Purple'], specials: [], points: 20, image: '/cards/PowerPglove.png' },
  
  // NEW CARDS FROM USER LIST
  { id: 'pokecheck-1', name: 'Poke Check', number: 3, suits: ['Stick'], actions: ['Poke-check'], abilities: ['Yellow'], specials: [], points: 10, image: '/cards/Pokehelmet.png' },
  { id: 'utility-faceoff', name: 'Faceoff Utility', suits: ['Helmet', 'Skate', 'Glove', 'Stick'], hideSuits: true, actions: [], abilities: [], specials: ['U', 'Promotion Special: Face-off'], points: 15, image: '/cards/Face-off.png' },
  { id: 'utility-finesse', name: 'Finesse Utility', suits: ['Helmet', 'Skate', 'Glove', 'Stick'], hideSuits: true, actions: [], abilities: [], specials: ['U', 'Promotion Special: Finesse'], points: 15, image: '/cards/Finesse.png' },
  { id: 'utility-elite', name: 'Elite Utility', suits: ['Helmet', 'Skate', 'Glove', 'Stick'], hideSuits: true, actions: [], abilities: [], specials: ['U', 'Promotion Special: Elite'], points: 20, image: '/cards/Elite.png' },
  { id: 'utility-plain', name: 'Utility', suits: ['Helmet', 'Skate', 'Glove', 'Stick'], hideSuits: true, actions: [], abilities: [], specials: ['U', 'Promotion Special: Utility'], points: 10, image: '/cards/Utility.png' },
  { id: 'rush-9', name: 'Rush 9', number: 9, suits: ['Skate'], actions: [], abilities: ['Orange'], specials: [], points: 12, image: '/cards/Rushhelmglove.png' },
  { id: 'rush-10', name: 'Rush 10', number: 10, suits: ['Skate'], actions: [], abilities: ['Orange'], specials: [], points: 15, image: '/cards/Rushhelmglove.png' },
  { id: 'shoot-puck', name: 'Shoot the Puck', number: 6, suits: ['Helmet', 'Skate', 'Glove', 'Stick'], actions: ['Move', 'Shoot'], abilities: ['Blue'], specials: [], points: 20, image: '/cards/Shootpuck.png' },
  { id: 'goal', name: 'Goal', number: 0, suits: ['Helmet', 'Skate', 'Glove', 'Stick'], actions: [], abilities: ['Purple'], specials: [], points: 50, image: '/cards/Goalhelm.png' },
  { id: 'crowd', name: 'Crowd', suits: ['Helmet', 'Skate', 'Glove', 'Stick'], actions: [], abilities: ['Silver'], specials: ['C', 'Crowd'], points: 5, image: '/cards/Crowd.png' },
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







        if (playerPrefix === 'white' && name === 'Body Check') {
          if (i === 0) card.image = '/cards/Bodycheckglove.png';
          if (i === 1) card.image = '/cards/Bodycheckhelm.png';
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
