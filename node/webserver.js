import express from 'express';
import { Server } from 'socket.io';
// https://stackoverflow.com/a/64383997/4982408
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ipAddress from './ipAddress.js';

// https://stackoverflow.com/a/64383997/4982408
const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);

const app = express();

// All web content is housed in the website folder
app.use(express.static(`${dirName}/../website/live`));

// TODO: Track if a move command HAS come in from a client, has not been zeroed, and they disconnect, so we can stop it.

// TODO: Deal with the case of a GET to move in a direction (as opposed to to a location) that is never stopped (timeout?)

function strippedRobotModel(inputRobotModel) {
  const copy = { ...inputRobotModel };
  // Use this to strip out anything the front end shouldn't see.
  delete copy.cloudServer;
  return copy;
}

const webServerPort = 8080;

async function webserver() {
  /** @namespace robotModel.webServerPort */
  const webServer = app.listen(webServerPort || 80);
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
    // const emitRobotModelToFrontEnd = () => {
    //   socket.emit('robotModel', JSON.stringify(strippedRobotModel(robotModel)));
    // };
    //
    // emitRobotModelToFrontEnd();
    //
    // robotModelEmitter.on('update', () => {
    //   emitRobotModelToFrontEnd();
    // });
    //
    // socket.on('servo360', (data) => {
    //   if (data && data.target && (data.value === 0 || data.value)) {
    //     operateServo360({ servoName: data.target, value: data.value });
    //   }
    // });
  });

  let port = '';
  if (webServer && webServer !== 80) {
    port = `:${webServerPort}`;
  }

  console.log(`Web server is running at: http://${ipAddress()}${port}/`);
}

export default webserver;
