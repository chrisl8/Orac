import express from 'express';
import { Server } from 'socket.io';
// https://stackoverflow.com/a/64383997/4982408
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ipAddress from './ipAddress.js';
import {
  statusEmitter,
  trackedStatusObject,
} from './trackedStatusDataModel.js';

// https://stackoverflow.com/a/64383997/4982408
const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);

const app = express();

// All web content is housed in the website folder
app.use(express.static(`${dirName}/../website`));

const webServerPort = 8080;

async function webserver() {
  /** @namespace robotModel.webServerPort */
  const webServer = app.listen(webServerPort || 80);
  // NOTE: This CORS entry is only required if you want to connect from a dev intance running on "localhost"
  const io = new Server(webServer, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  // HTTP GET Listeners
  // app.get('/model', (req, res) => {
  //   res.json(strippedRobotModel(robotModel));
  // });

  // Socket listeners
  io.on('connection', (socket) => {
    const address = socket.request.connection.remoteAddress;
    console.log(`Web connection from ${address}`);

    // NOTE: This is debounced at 300ms on the sending end.
    // If that debounce is removed, then be sure to debounce
    // it here!
    const emitStatusToFrontEnd = () => {
      socket.emit('status', JSON.stringify(trackedStatusObject));
    };

    emitStatusToFrontEnd();

    statusEmitter.on('update', () => {
      emitStatusToFrontEnd();
    });
  });

  let port = '';
  if (webServerPort && webServerPort !== 80) {
    port = `:${webServerPort}`;
  }

  console.log(`Web server is running at: http://${ipAddress()}${port}/`);
}

export default webserver;
