import { spawn } from 'child_process';

/**
 * An async Promise function
 * @param {String} path
 * @param args
 * @param silent
 * @returns {Promise<unknown>}
 */
function spawnProcess({ path, args = [], silent }) {
  // *** Return the promise
  return new Promise((resolve, reject) => {
    const process = spawn(path, args);
    let outputData = '';
    process.stdout.on('data', (data) => {
      outputData += data;
    });
    process.stderr.on('data', (data) => {
      if (!silent) {
        console.error(String(data));
      }
    });
    process.on('close', (code) => {
      if (code > 0) {
        reject(code);
      }
      if (!silent && outputData) {
        console.log(String(outputData));
      }
      resolve(String(outputData));
    });
  });
}

export default spawnProcess;
