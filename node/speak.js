import { dirname } from 'path';
import { fileURLToPath } from 'url';
import spawnProcess from './spawnProcess.js';
import onboardLeds from './onboardLeds.js';

// https://stackoverflow.com/a/64383997/4982408
// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);

async function speak(text) {
  console.log(`"${text}"`);
  onboardLeds.lightUp();
  await spawnProcess({
    path: `${__dirname}/../pi/scripts/speak.sh`,
    args: [`--text`, text, '--volume', 100],
  });
}

export default speak;
