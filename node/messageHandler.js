import speak from './speak.js';
import pushMe from './pushMe.js';
import trackedStatusObject from './trackedStatusObject.js';
import taskHandler from './taskHandler.js';
import taskListObject from './taskListObject.js';

const messageHandler = (message) => {
  let oldMessage = false;
  if (message && message.event) {
    switch (message.event) {
      case 'disconnect':
        console.log('Lost connection to Robot Web Server.');
        break;
      case 'connect':
        console.log('Robot Web Server connected.');
        break;
      case 'welcome':
        console.log('Robot Web Server welcomes you!');
        break;
      case 'oldMessage':
        oldMessage = true;
      // eslint-disable-next-line no-fallthrough
      case 'newMessage':
        if (message.data && message.data.type) {
          switch (message.data.type) {
            case 'text':
              if (message.data && message.data.text) {
                const cleanMessageText = message.data.text
                  .trim()
                  .replace(/\.+$/, '')
                  .toLowerCase();
                if (cleanMessageText.includes('conquer the known universe')) {
                  speak('All your base are belong to us!');
                  pushMe('All your base are belong to us!');
                } else if (cleanMessageText.includes('done')) {
                  for (const [key, value] of Object.entries(taskListObject)) {
                    value.completedTexts.forEach((entry) => {
                      if (cleanMessageText.includes(entry)) {
                        taskHandler.completed(key);
                      }
                    });
                  }
                } else {
                  console.log(
                    `${oldMessage ? 'OLD' : ''}Message with bad data:`,
                    message,
                  );
                }
              }
              break;
            default:
              console.log('Unknown data from Robot Web Server:', message);
          }
        }
        break;
      default:
        console.log(`Unknown message event type:`);
        console.log(message);
    }
  }
};

export default messageHandler;
