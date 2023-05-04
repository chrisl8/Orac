import { spawn } from 'child_process';

/**
 * An async Promise function
 * @param {String} path
 * @param args
 * @returns {Promise<unknown>}
 */
function spawnProcess({ path, args = [] }) {
  // *** Return the promise
  return new Promise((resolve, reject) => {
    const process = spawn(path, args);
    let outputData = '';
    process.stdout.on('data', (data) => {
      outputData += data;
    });
    process.stderr.on('data', (data) => {
      console.error(String(data));
    });
    process.on('close', (code) => {
      if (code > 0) {
        reject(code);
      }
      resolve(String(outputData));
    });
  });
}

export default spawnProcess;
