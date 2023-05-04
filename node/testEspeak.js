import { spawn } from 'child_process';

const espeakProcess = spawn(`/usr/bin/espeak`, ['Hello World']);
let expeakProcessOutput = '';
espeakProcess.stdout.on('data', (data) => {
  expeakProcessOutput += data;
});
espeakProcess.stderr.on('data', (data) => {
  console.error(String(data));
});
espeakProcess.on('close', (code) => {
  if (code > 0) {
    console.error(code);
  }
  if (expeakProcessOutput) {
    console.log(String(expeakProcessOutput));
  }
});
