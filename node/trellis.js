import { SerialPort } from 'serialport';
import process from 'process';
import esMain from 'es-main';
import UsbDevice from './UsbDevice.js';

let port;

const init = async (callback) => {
  const device = new UsbDevice(
    'Adafruit_Trellis_M4_0B387B045336573232202020FF15111C',
    'ID_SERIAL',
  );

  let path;
  try {
    path = await device.findDeviceName();
  } catch (e) {
    console.error(`Trellis not found.`);
  }

  if (path) {
    // Create a port
    port = new SerialPort({
      path,
      baudRate: 9600,
    });

    // Read data from port and display to terminal
    port.on('data', (data) => {
      if (data && data.toString() && data.toString().trim()) {
        callback(data.toString().trim());
      }
    });
  }
};

function writeToSerialPort(text) {
  // console.log(`trellis write ${text} ${Boolean(port)}`);
  if (port) {
    port.write(text, (err) => {
      if (err) {
        console.error('Trellis error on write: ', err.message);
      }
    });
  }
}

const toggleButton = ({ button, color }) => {
  writeToSerialPort(`<${button}:${color[0]},${color[1]},${color[2]}>`);
};

export default { init, writeToSerialPort, toggleButton };

if (esMain(import.meta)) {
  await init(console.log);

  // Read keyboard input from stdin
  // https://stackoverflow.com/a/12506613/4982408
  const stdin = process.stdin;

  // without this, we would only get streams once enter is pressed
  stdin.setRawMode(true);

  // resume stdin in the parent process (node app won't quit all by itself
  // unless an error or process.exit() happens)
  stdin.resume();

  // i don't want binary, do you?
  stdin.setEncoding('utf8');

  // on any data into stdin
  stdin.on('data', (key) => {
    // ctrl-c ( end of text )
    if (key === '\u0003') {
      process.exit();
    }
    // write the key to stdout all normal like
    // (or don't if you want it hidden)
    process.stdout.write(key);
    // Send key to serial port, as that is our goal in this test.
    writeToSerialPort(key);
  });

  // Testing
  writeToSerialPort('<31:0,0,255>');
  writeToSerialPort('<20:255,0,0>');
  writeToSerialPort('<8:0,255,255>');
}
