import speak from './speak.js';
import pushMe from './pushMe.js';

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
            case 'location':
              console.log(message.data);
              break;
            case 'text':
              if (message.data && message.data.text) {
                switch (
                  message.data.text.trim().replace(/\.+$/, '').toLowerCase()
                ) {
                  case 'conquer the known universe':
                    speak('All your base are belong to us!');
                    pushMe('All your base are belong to us!');
                    break;
                  default:
                    console.log(
                      `${oldMessage ? 'OLD ' : ''}Message from ${
                        message.data.from
                      }: ${message.data.text}.`,
                    );
                }
              } else {
                console.log(
                  `${oldMessage ? 'OLD' : ''}Message with bad data:`,
                  message,
                );
              }
              break;
            default:
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
};

export default messageHandler;
