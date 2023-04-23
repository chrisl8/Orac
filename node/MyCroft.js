import esMain from 'es-main';
import WebSocket from 'ws';
import wait from './wait.js';
import trackedStatusObject from './trackedStatusObject.js';

let connected;
let monitor;

// Use this list to exclude message types from logging to the console.
// Note that some of these may be VERY USEFUL, they just tend to be noisy,
// but you may need to comment one or more out when debugging or testing
// to add new features.
const ignoreMessageTypes = [
  'gui.value.set',
  'skill-ovos-date-time.openvoiceos.get_display_current_time',
  'skill-ovos-date-time.openvoiceos.get_display_current_time.response',
  'skill-ovos-date-time.openvoiceos.get_display_date',
  'skill-ovos-date-time.openvoiceos.get_display_date.response',
  'skill-ovos-date-time.openvoiceos.get_weekday',
  'skill-ovos-date-time.openvoiceos.get_weekday.response',
  'skill-ovos-date-time.openvoiceos.get_year',
  'skill-ovos-date-time.openvoiceos.get_year.response',
  'skill-ovos-date-time.openvoiceos.get_month_date',
  'skill-ovos-date-time.openvoiceos.get_month_date.response',
  'enclosure.eyes.blink',
  'enclosure.mouth.reset',
  'enclosure.mouth.display',
  'enclosure.mouth.events.activate',
];
// These types might be useful for other things too someday?

const ws = new WebSocket('ws://127.0.0.1:8181/core');

ws.on('connectFailed', (error) => {
  console.log(`Mycroft Connect Error: ${error.toString()}`);
  trackedStatusObject.keepRunning = false;
});

ws.on('error', (error) => {
  console.log(`Connection Error: ${error.toString()}`);
});
ws.on('close', () => {
  console.log('MyCroft connection closed.');
  trackedStatusObject.keepRunning = false;
});
ws.on('message', (data) => {
  const dataObject = JSON.parse(data.toLocaleString());
  if (!connected && dataObject.type === 'connected') {
    connected = true;
    console.log(
      `MyCroft found and Connected${monitor ? ', monitoring...' : '.'}`,
    );
  } else if (dataObject.type === 'speak') {
    console.log(`Mycroft said: ${dataObject.data.utterance}`);
    // webModelFunctions.update('myCroftSaid', messageObject.data.utterance);
  } else if (
    dataObject.type === 'arlobot' &&
    dataObject.data.hasOwnProperty('action')
  ) {
    // TODO: Set up an 'orac' and/or 'arlobot' skill?
    switch (dataObject.data.action) {
      case 'startROS':
        console.log('ROSstart');
        // webModelFunctions.update('ROSstart', true);
        break;
      case 'makeMap':
        console.log('makeMap');
        // webModelFunctions.update('makeMap', true);
        break;
      case 'unplugYourself':
        console.log('unplugYourself');
        // webModelFunctions.update('unplugYourself', true);
        break;
      default:
        console.log(`Unknown Mycroft action: ${dataObject.data.action}`);
    }
    // webModelFunctions.update('myCroftSaid', messageObject.data.utterance);
  } else if (monitor && ignoreMessageTypes.indexOf(dataObject.type) === -1) {
    console.log(dataObject);
  }
});

const timeout = 30;

const injectText = async (text) => {
  let timeWaited = 0;
  while (!connected && timeWaited < timeout) {
    // Wait for connection
    timeWaited++;
    // eslint-disable-next-line no-await-in-loop
    await wait(1000);
  }
  if (connected) {
    // If you just want to SEE what Mycroft puts on the bus, don't send anything,
    // Then you can just watch and use what it gives you as a template
    //
    // The message bus is documented here:
    // https://docs.mycroft.ai/overview/messagebus

    // To just speak any text use this:
    // connection.sendUTF(JSON.stringify({message_type: 'speak', context: null, metadata: {utterance: 'Hello world'}}));

    // To 'inject' something as if it was spoken to mycroft use this:
    // This is where text comes in after being deciphered by the STT service.

    // {"type": "recognizer_loop:utterance", "data": {"lang": "en-us", "utterances": ["hi"]}, "context": null}
    ws.send(
      JSON.stringify({
        type: 'recognizer_loop:utterance',
        data: {
          lang: 'en-us',
          utterances: [text],
        },
        context: null,
      }),
    );
  } else {
    console.error('No MyCroft connection found.');
    trackedStatusObject.keepRunning = false;
  }
};

const sayText = async (text) => {
  let timeWaited = 0;
  while (!connected && timeWaited < timeout) {
    // Wait for connection
    timeWaited++;
    // eslint-disable-next-line no-await-in-loop
    await wait(1000);
  }
  if (connected) {
    ws.send(
      JSON.stringify({
        data: {
          expect_response: false,
          utterance: text,
        },
        type: 'speak',
        context: null,
      }),
    );
  } else {
    console.error('No MyCroft connection found.');
    trackedStatusObject.keepRunning = false;
  }
};

export default { injectText, sayText };

function provideUsageInformation() {
  console.log(
    "You must provide an option of either 'monitor', 'inject' or 'say' and text for the message, like this:",
  );
  console.log(`node MyCroft.js monitor`);
  console.log(`node MyCroft.js say "Hello World!"`);
  console.log(`node MyCroft.js inject "what time is it"`);
}

if (esMain(import.meta)) {
  if (process.argv.length < 3) {
    provideUsageInformation();
    process.exit(1);
  }
  if (process.argv[2] === 'monitor') {
    monitor = true;
  } else if (process.argv.length > 3 && process.argv[2] === 'say') {
    await sayText(process.argv[3]);
    process.exit(0);
  } else if (process.argv.length > 3 && process.argv[2] === 'inject') {
    await injectText(process.argv[3]);
    process.exit(0);
  } else {
    provideUsageInformation();
    process.exit(1);
  }
}
