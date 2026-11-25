// What the game says, for the clips (tts/make-voice.mjs, tts/lines.mjs). The sentences themselves are found in the files below; this
// fills in the holes in them and adds the lines that are put together in other ways. A new hole in a sentence inside say() stops
// `npm test` until it is given here.
import { constFrom } from './lines.mjs';

export default {
  files: ['game-core.js', 'audio.js', 'game.js', 'effects.js', 'duck.js', 'bedtime.js', 'teeth.js', 'routines.js', 'planet-play.js', 'house-quiz.js'],
  // Never read: the download size in the voice's note in the settings.
  skip: [/\bMB\b/],
  // Functions whose arguments are read aloud.
  calls: ['say', 'speak', 'talk', 'letter', 'score', 'finishPlay'],
  values(root) {
    const bodies = constFrom(root, 'game-core.js', 'BODIES'), moons = constFrom(root, 'game-core.js', 'MOONS');
    const belt = constFrom(root, 'game-core.js', 'BELT'), foods = constFrom(root, 'routines.js', 'FOODS').map(f => f.name);
    const letterNames = constFrom(root, 'audio.js', 'LETTER_NAMES'), letters = Object.keys(letterNames), names = [...bodies, ...moons].map(b => b.name);
    const any = [...names, belt.name];
    const v = {};
    for (const k of ['entry.body.name', 'state.target.name', 'p.name', 'a.name', 'parentOf(p).name', 'state.origin.name', 'next.name']) v[k] = any;
    v['state.location.name.toLowerCase()'] = any.map(n => n.toLowerCase());
    v['FOODS[meal.food].name'] = v.f = foods;
    for (const k of ['LETTER_NAMES[o.ch]||o.ch', 'LETTER_NAMES[next]||next', 'LETTER_NAMES[a.word[0]]']) v[k] = Object.values(letterNames);
    for (const k of ['word[0]', 'word[play.count]', 'o.ch', 'next', 'a.word[0]', 'state.word[state.index]']) v[k] = letters;
    v['p.word'] = bodies.map(b => b.word);
    // gameAudio.letter(): «… mars! Bra, Sofia!» when a word is done; planet-play.js: Jupiter's moons and counting them.
    v['completedWord.toLowerCase()'] = [...bodies.map(b => b.word), ...Object.values(constFrom(root, 'game-core.js', 'PLAYS')).filter(p => p.word).map(p => p.word)].map(w => w.toLowerCase());
    v['o.m.name'] = moons.map(m => m.name);
    v['NUMBER_WORDS[o.n]'] = constFrom(root, 'planet-play.js', 'NUMBER_WORDS');
    v['duckFlying()?\'Anda\':\'Romraketten\''] = ['Anda', 'Romraketten'];
    v['duckFlying()?\'Anda\':\'Raketten\''] = ['Anda', 'Raketten'];
    return v;
  },
  patterns: {
    // The brushing chart: one star for each brushing, up to ten; then the walls. After 120 the device's voice reads the number.
    "Nå har du {n} {n===1?'stjerne':'stjerner'} på tannpusskartet.": Array.from({ length: 10 }, (_, i) => `Nå har du ${i + 1} ${i ? 'stjerner' : 'stjerne'} på tannpusskartet.`),
    'Nå har du {n} stjerner på veggene.': Array.from({ length: 109 }, (_, i) => `Nå har du ${i + 12} stjerner på veggene.`),
  },
  extra(root) {
    const bodies = constFrom(root, 'game-core.js', 'BODIES'), plays = constFrom(root, 'game-core.js', 'PLAYS');
    const letterNames = constFrom(root, 'audio.js', 'LETTER_NAMES'), numberWords = constFrom(root, 'planet-play.js', 'NUMBER_WORDS');
    const words = [...bodies.map(b => b.word), ...Object.values(plays).filter(p => p.word).map(p => p.word)];
    return [
      // gameAudio.letter(): the letter's name, and when a word is done: «be. mars! Bra, Sofia!»
      ...Object.values(letterNames), ...Object.values(letterNames).map(n => n + '.'), ...words.map(w => w.toLowerCase() + '!'),
      // planet-play.js score(): counting out loud
      ...numberWords.map(w => w + '!'),
    ];
  },
};
