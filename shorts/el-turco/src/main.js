// La máquina que venció a Napoleón: builds the sets and cast, the shared runtime does the rest.
import { run } from '../../engine/runtime.js';
import { makeChar, CAST } from '../../engine/characters.js';
import * as SETS from './sets.js';
import { makeShots } from './shots.js';

run(async (W) => {
  const sets = { hall: await SETS.hall(), outside: await SETS.outside(), glory: await SETS.glory() };
  const chars = {
    NAPO: makeChar({ ...CAST.NAPO, arm: 1.2 }, 1), TURK: makeChar(CAST.TURK, 7), OWNER: makeChar(CAST.OWNER, 3), HIDDEN: makeChar({ ...CAST.HIDDEN, hat: null }, 5),
    NOBLE2: makeChar(CAST.NOBLE2, 8), NOBLE3: makeChar(CAST.NOBLE3, 9), EXTRA1: makeChar(CAST.EXTRA1, 10), EXTRA2: makeChar(CAST.EXTRA2, 11),
  };
  const world = { ...W, sets, chars };
  return { ...world, shots: makeShots(world) };
});
