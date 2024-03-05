import { dirname } from 'path';
import { fileURLToPath } from 'url';
import spawnProcess from './spawnProcess.js';

// https://stackoverflow.com/a/64383997/4982408
// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);

async function playWav({ shortFileName }) {
  if (shortFileName) {
    const soundFileName = `${__dirname}/../Sounds/${shortFileName}.wav`;
    await spawnProcess({
      path: `${__dirname}/../pi/scripts/playSound.sh`,
      args: ['--path', soundFileName, '--volume', 100],
      silent: true,
    });
  } else {
    console.error('No sound file name provided.');
  }
}

export default playWav;
