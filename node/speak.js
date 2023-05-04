import spawnProcess from './spawnProcess.js';

async function speak(text) {
  console.log(`"${text}"`);
  await spawnProcess({
    path: `/usr/bin/espeak`,
    args: ['-v', 'en-scottish', '-p', '0', '-s', '150', text],
  });
}

export default speak;
