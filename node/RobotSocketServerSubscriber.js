import io from 'socket.io-client';
import esMain from 'es-main';
import getRobotWebServerConfig from './getRobotWebServerConfig.js';
import getBasicConfig from './getBasicConfig.js';

const robotWebServerConfig = await getRobotWebServerConfig();
const basicConfig = await getBasicConfig();

class RobotSocketServerSubscriber {
  constructor(messageHandler) {
    this.remoteServer = `${robotWebServerConfig.service}://${robotWebServerConfig.fqdn}:${robotWebServerConfig.port}`;
    this.messageHandler = messageHandler;
  }

  start() {
    const socket = io(this.remoteServer);
    socket.on('connect', () => {
      this.messageHandler({
        event: 'connect',
      });
      socket.emit('new robot', {
        name: basicConfig.name,
        password: robotWebServerConfig.password,
      });
    });
    socket.on('event', (data) => {
      // Use this for testing any incoming event you want to.
      // Create more specific "events" when you know what you want to do.
      this.messageHandler({
        event: 'event',
        data,
      });
    });
    socket.on('newMessage', (data) => {
      this.messageHandler({
        event: 'newMessage',
        data,
      });
    });
    socket.on('oldMessage', (data) => {
      console.log({
        event: 'oldMessage',
        data,
      });
    });
    socket.on('welcome', () => {
      this.messageHandler({
        event: 'welcome',
      });
    });
    socket.on('disconnect', () => {
      this.messageHandler({
        event: 'disconnect',
      });
    });
  }
}

export default RobotSocketServerSubscriber;

if (esMain(import.meta)) {
  const socketServerSubscriber = new RobotSocketServerSubscriber(console.log);
  socketServerSubscriber.start();
}
