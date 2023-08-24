// Send message via Pushover API, which is free!
import Push from 'pushover-notifications';
import esMain from 'es-main';
import getPushoverConfig from './getPushoverConfig.js';

const configObject = await getPushoverConfig();

function pushMe(text, ttl = 60 * 10) {
  if (text) {
    const p = new Push({
      user: configObject.USER,
      token: configObject.TOKEN,
    });
    const msg = {
      message: text,
      ttl,
      // sound: personalData.pushover.sound,
      // priority: -1,
    };
    p.send(msg); // Silent with no error reporting
  }
}

export default pushMe;

if (esMain(import.meta)) {
  if (process.argv.length < 3) {
    console.log('You must provide text for the message, like this:');
    console.log(`node pushMe.js "test message"`);
    process.exit();
  }
  pushMe(process.argv[2]);
}
