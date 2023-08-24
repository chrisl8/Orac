import { dirname } from 'path';
import { fileURLToPath } from 'url';
import spawnProcess from './spawnProcess.js';

// https://stackoverflow.com/a/64383997/4982408
// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);

function lightUp() {
  const script = `${__dirname}/../pi/utils/ledtest_old.py`;
  spawnProcess({
    path: 'python',
    args: [script],
    silent: true,
  });
}

export default { lightUp };
