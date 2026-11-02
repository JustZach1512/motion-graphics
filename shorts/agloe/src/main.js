// El pueblo que no existía: builds the sets and cast, the shared runtime does the rest.
import { run } from '../../engine/runtime.js';
import { makeChar, CAST } from '../../engine/characters.js';
import * as T from '../../engine/textures.js';
import * as SETS from './sets.js';
import { makeShots } from './shots.js';

run(async (W) => {
  const en = W.LANG === 'en';
  const maps = {
    plain: await T.mapTexture({}), agloe: await T.mapTexture({ agloe: true }),
    rival: await T.mapTexture({ tint: '#b9d0f2', agloe: true, publisher: en ? 'THE COMPETITION' : 'LA COMPETENCIA' }),
    copy: await T.mapTexture({ publisher: en ? 'TOTALLY ORIGINAL' : 'TOTALMENTE ORIGINAL' }),
  };
  const sets = {
    office: await SETS.office(maps), rival: await SETS.rivalOffice(maps), city: await SETS.city(), country: await SETS.country(),
    map: await SETS.mapDesk(maps), money: await SETS.money(), trap: await SETS.trapTable(),
  };
  const chars = { OTTO: makeChar(CAST.OTTO, 1), ERNEST: makeChar(CAST.ERNEST, 2), RIVAL: makeChar(CAST.RIVAL, 3), GROCER: makeChar(CAST.GROCER, 4) };
  const world = { ...W, sets, chars, maps };
  return { ...world, shots: makeShots(world) };
});
