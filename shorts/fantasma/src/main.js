// El ejército de goma: builds the sets and cast, the shared runtime does the rest.
import { run } from '../../engine/runtime.js';
import { makeChar, CAST } from '../../engine/characters.js';
import * as EP from '../../engine/props.js';
import * as SETS from './sets.js';
import * as P from './props.js';
import { makeShots } from './shots.js';

run(async (W) => {
  const sets = { day: await SETS.day(), night: await SETS.night(), cafe: await SETS.cafe() };
  const chars = {
    A: makeChar(CAST.SOLDIER, 1), B: makeChar(CAST.SOLDIER2, 2), C: makeChar(CAST.SOLDIER3, 3), D: makeChar(CAST.SOLDIER, 4),
    F1: makeChar(CAST.FARMER1, 5), F2: makeChar(CAST.FARMER2, 6), ART: makeChar(CAST.ARTIST, 7), ART2: makeChar({ ...CAST.SOLDIER3, hat: 'beret', hatColor: '#7a1f2a' }, 8),
    SPY: makeChar(CAST.SPY, 9),
  };
  chars.B.userHandset = P.handset(); chars.ART.userBrush = EP.brush(); chars.ART2.userBrush = EP.brush();
  const world = { ...W, sets, chars };
  return { ...world, shots: makeShots(world) };
});
