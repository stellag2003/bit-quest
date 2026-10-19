import { ENERGY_MAX, ENERGY_REGEN_MS } from '../../domain/energy.js';
import { REWARDS } from '../../domain/scoring.js';
import { ECONOMY } from '../palettes.js';

/** English translation of the game content. Ids mirror the Portuguese source. */
export const EN = {
  fases: {
    f1: {
      title: 'Sequences',
      concept: {
        title: 'Sequence',
        summary: 'A program is a list of commands. The computer does them one at a time, from first to last.',
      },
      lesson: [
        'Hi! This is Bit, a robot who loves following instructions.',
        'A program is a list of commands. Bit does them one at a time, in order.',
        'If the order changes, the path changes. Ready to build your first program?',
      ],
      challenges: {
        'f1-c1': {
          title: 'First steps',
          goal: 'Take Bit to the flag.',
          hints: ['Count the squares between Bit and the flag.', 'It\'s 3 steps forward: Walk, Walk, Walk.'],
        },
        'f1-c2': {
          title: 'The turn',
          goal: 'The flag is around the corner.',
          hints: ['Bit needs to turn before the tree.', 'Walk 2, turn right and walk 2 more.'],
        },
        'f1-c3': {
          title: 'Rock in the way',
          goal: 'Get past the rock and reach the flag.',
          hints: ['Rocks are short: you can Jump over them.', 'Walk, jump the rock, turn left and walk 2.'],
        },
      },
    },
    f2: {
      title: 'Decisions',
      concept: {
        title: 'Condition',
        summary: 'IF something happens, THEN do an action. That way the program decides what to do by itself.',
      },
      lesson: [
        'Now Bit walks by himself... but the path has surprises.',
        'Programs make decisions. IF there\'s a rock ahead, THEN Bit jumps.',
        'When no rule matches, Bit just walks forward.',
      ],
      challenges: {
        'f2-c1': {
          title: 'Jump the rocks',
          goal: 'Make a rule to get past the rocks.',
          hints: ['Choose the IF: what does Bit see ahead?', 'IF rock ahead, THEN jump.'],
        },
        'f2-c2': {
          title: 'Dodge the walls',
          goal: 'Teach Bit to take the turns by himself.',
          hints: ['What should Bit do when a wall shows up?', 'Look where the path goes: the turn is to the right.'],
        },
        'f2-c3': {
          title: 'Two maps',
          goal: 'The same rules must beat both maps.',
          hints: ['You\'ll need two rules: one for rocks and one for walls.', 'IF rock → jump. IF wall → turn right.'],
        },
      },
    },
    f3: {
      title: 'Repetition',
      concept: {
        title: 'Repetition (loop)',
        summary: 'Instead of writing the same command many times, use Repeat and say how many times.',
      },
      lesson: [
        'Look: Walk, Walk, Walk, Walk, Walk... how tiring!',
        'With Repeat 5× Walk, you write it once and Bit repeats it by himself.',
        'This is called a loop. Now every challenge has a block limit. Save blocks!',
      ],
      challenges: {
        'f3-c1': {
          title: 'Long hallway',
          goal: 'Reach the flag using only 2 blocks.',
          hints: ['Put down the Repeat block and a Walk inside it.', 'Tap the ×2 to change how many times to repeat. Count the squares!'],
          successMessage: 'You just made a loop! It lets you repeat an action many times without writing the same command again and again.',
        },
        'f3-c2': {
          title: 'Staircase',
          goal: 'Climb the stairs with 5 blocks at most.',
          hints: ['Every step is the same: walk, turn, walk, turn.', 'Repeat 3× [Walk, Turn ↺, Walk, Turn ↻].'],
        },
        'f3-c3': {
          title: 'Jumping to the beat',
          goal: 'Find the pattern and use only 3 blocks.',
          hints: ['Before each rock there\'s an empty square. What\'s the pattern?', 'Repeat 3× [Walk, Jump].'],
        },
      },
    },
    f4: {
      title: 'Debugging',
      concept: {
        title: 'Debugging',
        summary: 'Debugging means finding and fixing a mistake in a program. Run it, see where Bit stopped and change only what is wrong.',
      },
      lesson: [
        'Not every program works the first time. A mistake in a program is called a bug.',
        'This program has a bug: one step too many. Run it, see where Bit bumps and find the guilty block.',
        'Fix only what is wrong: remove a block, change a number or swap a rule.',
      ],
      challenges: {
        'f4-c1': {
          title: 'One step too many',
          goal: 'The program has a bug. Fix it and take Bit to the flag.',
          hints: ['Run the program: at which block does Bit bump into the tree?', 'There\'s an extra Walk before the Turn. Tap it to remove it.'],
        },
        'f4-c2': {
          title: 'Wrong count',
          goal: 'The Repeat is counting wrong. Fix the number.',
          hints: ['Bit stops before the flag. How many squares are missing?', 'Count the squares to the flag and tap the Repeat number until you get there.'],
        },
        'f4-c3': {
          title: 'Mixed-up rule',
          goal: 'One of the rules is wrong. Find out which one and fix it.',
          hints: ['The rock rule works. Look at the wall rule.', 'The path turns right. Tap the THEN of the wall rule and choose Turn right.'],
        },
      },
    },
    f5: {
      title: 'Functions',
      concept: {
        title: 'Function',
        summary: 'A function is a new block you make by putting other blocks together. Then you can use that block as many times as you want.',
      },
      lesson: [
        'Sometimes the same piece of a program shows up many times. You can write it just once!',
        'Put the steps inside the ★ Function. Every ★ block you use does everything inside it.',
        'First build the function up top. Then use the ★ block in your program.',
      ],
      challenges: {
        'f5-c1': {
          title: 'The magic block',
          goal: 'Make a function and reach the flag with only 5 blocks.',
          hints: ['The path repeats: Walk, Walk, Jump.', 'Function: Walk, Walk, Jump. Program: ★ and ★.'],
        },
        'f5-c2': {
          title: 'Sonja\'s staircase',
          goal: 'Climb the stairs using 7 blocks at most.',
          hints: ['Every step is the same: walk, turn, walk, turn.', 'Function: Walk, Turn right, Walk, Turn left. Use ★ three times.'],
        },
        'f5-c3': {
          title: 'Hidden pattern',
          goal: 'Find the piece that repeats and use 8 blocks at most.',
          hints: ['Before and after each turn, Bit does: Walk, Jump, Walk.', 'Function: Walk, Jump, Walk. Program: ★, Turn right, ★, Turn left, ★.'],
        },
      },
    },
    f6: {
      title: 'All together',
      concept: {
        title: 'Computational thinking',
        summary: 'Programmers mix everything they have learned: sequences, decisions, repetition and functions. Choose the best tool for each path.',
      },
      lesson: [
        'You already know sequences, decisions, repetition and functions. Now it\'s time to put it all together!',
        'Before building, look at the whole map: what repeats? Where does Bit need to decide?',
        'There isn\'t just one right way. But the best program is short and easy to understand.',
      ],
      challenges: {
        'f6-c1': {
          title: 'Maze of rules',
          goal: 'Make the rules that take Bit through the whole maze.',
          hints: ['You\'ll need one rule for rocks and another for walls.', 'IF rock → Jump. IF wall → Turn right.'],
        },
        'f6-c2': {
          title: 'Around the plaza',
          goal: 'Go around the rocks using only 4 blocks.',
          hints: ['Walk, Jump, Turn... and again. How many times?', 'Repeat 3× [Walk, Jump, Turn right].'],
        },
        'f6-c3': {
          title: 'Final challenge',
          goal: 'Use a function inside the Repeat. 8 blocks at most!',
          hints: ['The piece Walk, Jump, Walk shows up 4 times, with turns between them.', 'Function: Walk, Jump, Walk. Program: Repeat 2× [★, Turn right, ★, Turn left].'],
        },
      },
    },
  },

  mentors: {
    ada: {
      area: 'Math and the first programs',
      intro: 'English mathematician. In 1843 she wrote one of the first algorithms meant for a calculating machine.',
      fact: 'Ada imagined that these machines might one day even compose music, long before computers existed.',
      message: 'A machine follows steps. You are the one who chooses the steps!',
      unlockText: 'Already with you from the start.',
    },
    grace: {
      area: 'Programming languages',
      intro: 'Computer scientist and US Navy admiral. She created one of the first compilers, which turns words into instructions for the computer.',
      fact: 'In 1947, the Mark II computer team found a moth stuck in the machine and taped it into their logbook: a real “bug”!',
      message: 'Found a mistake? Great! Every bug you find makes your program stronger.',
      unlockText: 'Finish the Sequences stage.',
    },
    turing: {
      area: 'Logic and computer science',
      intro: 'British mathematician. In 1936 he imagined a simple machine that reads symbols and follows rules: the idea behind computers.',
      fact: 'Turing loved running. He ran marathons as fast as competitive athletes.',
      message: 'Big problem? Split it into small pieces and repeat what works.',
      unlockText: 'Finish the Decisions stage.',
    },
    katherine: {
      area: 'Math and space exploration',
      intro: 'NASA mathematician. She calculated spaceflight paths, like the one for the first American astronaut, in 1961.',
      fact: 'In 1962, before flying around the Earth, astronaut John Glenn asked her to double-check the computer\'s math.',
      message: 'Check, test and check again. Caring about details takes courage too.',
      unlockText: 'Finish the Repetition stage.',
    },
    sonja: {
      area: 'Theoretical physics',
      intro: 'Brazilian physicist, born in São Paulo. She was the first woman from Brazil to earn a PhD in physics, at the University of Cambridge, in England.',
      fact: 'Her advisor at Cambridge was Paul Dirac, one of the creators of quantum physics. Sonja finished her PhD when she was only 24.',
      message: 'Big ideas start with small questions. Don\'t be afraid to ask!',
      unlockText: 'Finish the Debugging stage.',
    },
    liane: {
      area: 'Computer networks and the internet',
      intro: 'Brazilian computer scientist and professor at UFRGS, in Porto Alegre. She helped bring the internet to Brazil\'s universities, when almost nobody knew what it was.',
      fact: 'In 2017, she joined the Internet Hall of Fame, which honors the people who helped build the internet around the world.',
      message: 'Computers get stronger when they talk to each other. So do people!',
      unlockText: 'Finish the Functions stage.',
    },
    jobs: {
      area: 'Personal computers and design',
      intro: 'American businessman. In 1976, he founded Apple with Steve Wozniak in a garage. The company helped bring computers into people\'s homes.',
      fact: 'In college, he took a calligraphy class, the art of drawing letters. Years later, that class inspired the beautiful letters of the Macintosh computer, from 1984.',
      message: 'A good program is one that anyone can use. Think about who is going to play!',
      unlockText: 'Finish the All together stage.',
    },
  },

  achievements: {
    'first-program': { title: 'First program', description: 'Finish your first challenge.' },
    flawless: { title: 'First try!', description: 'Get 3 stars on a challenge.' },
    debugger: { title: 'Bug hunter', description: 'Fix a program after a mistake.' },
    'loop-master': { title: 'Loop master', description: 'Finish the Repetition stage.' },
    'streak-3': { title: 'Three days in a row', description: 'Play 3 days in a row.' },
    'all-mentors': { title: 'Hall of mentors', description: 'Unlock every mentor.' },
    'star-sky': { title: 'Starry sky', description: 'Collect every star in the game.' },
  },

  palettes: {
    classic: { name: 'Classic', songName: 'Adventure' },
    pocket: { name: 'Pocket', songName: 'Stroll' },
    sunset: { name: 'Sunset', songName: 'Dusk' },
    ocean: { name: 'Ocean', songName: 'Tide' },
  },

  guide: {
    welcome: {
      title: 'Welcome to Bit Quest!',
      text: 'This is Mary, and you play as her! Together you\'ll teach Bit the robot to reach the flag by building programs with command blocks.',
      items: [
        ['Goal', 'take Bit to the flag'],
        ['6 stages', 'from Sequences to All together'],
      ],
    },
    sequence: {
      title: 'Stage 1 · Sequences',
      text: 'Tap the commands to build the path, step by step. Bit does everything in the order you build it.',
      items: [
        ['Walk', 'one square forward'],
        ['Turn left', 'spins to the left'],
        ['Turn right', 'spins to the right'],
        ['Jump', 'hops over rocks'],
      ],
    },
    rules: {
      title: 'Stage 2 · Decisions',
      text: 'Now Bit walks by himself. You write IF/THEN rules so he can decide what to do along the way.',
      items: [
        ['IF rock ahead', 'THEN jump'],
        ['IF wall ahead', 'THEN turn'],
        ['Two maps', 'the same rules must beat both'],
      ],
    },
    repeat: {
      title: 'Stage 3 · Repetition',
      text: 'The Repeat block runs the commands inside it several times. With it, you write less and do more.',
      items: [
        ['Repeat', 'put commands inside it'],
        ['Block limit', 'every challenge has a maximum'],
      ],
    },
    debug: {
      title: 'Stage 4 · Debugging',
      text: 'Here the challenge starts with a program that has a bug. Run it, find out where Bit goes wrong and fix it.',
      items: [
        ['Find the bug', 'run it and see where Bit stops'],
        ['Remove a block', 'tap the wrong block'],
        ['Change a number', 'tap the × on the Repeat'],
      ],
    },
    functions: {
      title: 'Stage 5 · Functions',
      text: 'Build the ★ Function once and use the ★ block as many times as you want. In stage 6 you put it all together!',
      items: [
        ['★ Function', 'put up to 4 blocks in it'],
        ['★ block', 'does everything in the function'],
        ['Stage 6 · All together', 'mixes everything you learned'],
      ],
    },
    run: {
      title: 'Run and fix',
      text: 'When your program is ready, run it and watch Bit go. Making mistakes is part of programming!',
      items: [
        ['Run', 'starts your program'],
        ['Block with "!"', 'shows where Bit went wrong'],
        ['Hint', 'ask for help when you\'re stuck'],
        ['Try again', 'your program is still there'],
      ],
    },
    energy: {
      title: 'Energy',
      text: `You have up to ${ENERGY_MAX} energy. Every run that goes wrong costs 1. An empty program or an unfinished rule costs nothing.`,
      items: [
        ['Refills by itself', `+1 every ${ENERGY_REGEN_MS / 60000} minutes`],
        ['Winning gives back', '+1 energy per challenge won'],
        ['Quick refill', `${ECONOMY.energyRefillPrice} coins fill it all up`],
        ['Easy level', 'mistakes cost no energy'],
      ],
    },
    rewards: {
      title: 'Rewards',
      text: 'The fewer mistakes and blocks, the more stars. Every challenge you win gives XP and coins.',
      items: [
        ['Stars', 'up to 3 per challenge'],
        ['Coins', `${REWARDS.coinsPerStar} per star, +${REWARDS.faseBonusCoins} per stage`],
        ['Streak', 'play every day to make it grow'],
        ['Medals', 'special achievements'],
      ],
    },
    mentors: {
      title: 'Mentors and Learn',
      text: 'Real people from computing keep you company. Finish stages to unlock new mentors.',
      items: [
        ['Mentors', 'Ada, Grace, Alan, Katherine, Sonja, Liane and Steve'],
        ['Learn', 'mentors, concepts and medals'],
        ['Screen colors', 'every new color brings a new song'],
      ],
    },
    controls: {
      title: 'Controls',
      text: 'Tap the screen to play. You can also use the D-pad, the A and B buttons, or the keyboard.',
      items: [
        ['Arrows', 'move the cursor'],
        ['A', 'confirm (Z or Enter)'],
        ['B', 'go back or erase (X or Esc)'],
      ],
    },
  },

  feedback: {
    failures: {
      empty: { title: 'Your program is empty', hint: 'Tap the commands down below to build the path.' },
      empty_loop: { title: 'The Repeat is empty', hint: 'Put at least one command inside the Repeat.' },
      empty_function: { title: 'The function is empty', hint: 'Put commands inside the ★ Function before using it.' },
      incomplete_rule: { title: 'The rule isn\'t finished', hint: 'Every rule needs an IF and a THEN.' },
      too_many_blocks: { title: 'Too many blocks!', hint: 'Use Repeat to write less.' },
      edge: { title: 'Bit almost fell off the map!', hint: 'Count the squares to the flag.' },
      hit_wall: { title: 'Bonk! Bit bumped into the wall.', hint: 'Before the wall, try Turn.' },
      hit_rock: { title: 'Bit tripped on the rock!', hint: 'Rocks are short: use Jump.' },
      jump_wall: { title: 'That wall is too tall!', hint: 'You can only jump rocks. For walls, turn.' },
      bad_landing: { title: 'Bit can\'t land there.', hint: 'Bit jumps 2 squares. Check where he will land.' },
      not_reached: { title: 'The commands ran out before the flag.', hint: 'Almost there! Add more commands.' },
      stuck_loop: { title: 'Bit is walking in circles!', hint: 'Maybe the turn goes the other way?' },
      too_long: { title: 'Bit walked too far and got lost.', hint: 'Check your rules: do they get him to the flag?' },
    },
    encouragements: [
      'Mistakes are part of learning.',
      'Every programmer tests and fixes.',
      'Found a bug? Now just fix it!',
      'Almost there. Try again!',
    ],
    praise: ['Nice job!', 'Perfect program!', 'Wow, it worked!', 'Sharp thinking!'],
  },
};
