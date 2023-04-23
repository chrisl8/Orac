import esMain from 'es-main';
import getRobotWebServerConfig from './getRobotWebServerConfig.js';

// https://stackoverflow.com/a/6182519/4982408
// base64 encode
// console.log(Buffer.from("Hello World").toString('base64'));
//
// base64 decode
// console.log(Buffer.from("SGVsbG8gV29ybGQ=", 'base64').toString('ascii'))

const RobotWebServerData = async () => {
  const robotWebServerConfig = await getRobotWebServerConfig();
  const url = `${robotWebServerConfig.service}://${robotWebServerConfig.fqdn}/hosts`;
  try {
    const result = await fetch(url, {
      method: 'get',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `ignored:${robotWebServerConfig.password}`,
        ).toString('base64')}`,
      },
    });

    if (result.ok) {
      const json = await result.json();
      if (json && json.length > 0) {
        return json;
      }
    } else {
      console.error('Error connecting to Robot Web Server:');
      console.error(result);
    }
  } catch (e) {
    console.error('Error connecting to Robot Web Server:');
    console.error(e);
  }
};

export default RobotWebServerData;

if (esMain(import.meta)) {
  (async () => {
    try {
      const robotWebserverData = await RobotWebServerData();
      console.log(robotWebserverData);
    } catch (e) {
      console.error(e);
    }
  })();
}
