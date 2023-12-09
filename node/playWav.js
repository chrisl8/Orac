import { dirname } from 'path';
import { fileURLToPath } from 'url';
import spawnProcess from './spawnProcess.js';

// https://stackoverflow.com/a/64383997/4982408
// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);

async function playWav({ shortFileName }) {
  const soundFileName = `${__dirname}/../Sounds/${shortFileName}.wav`;
  await spawnProcess({
    path: `${__dirname}/../pi/utils/playSound.sh`,
    args: ['--path', soundFileName, '--volume', 100],
    silent: true,
  });
}

export default playWav;
