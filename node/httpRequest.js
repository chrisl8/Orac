import esMain from 'es-main';
import wait from './wait.js';
import RobotWebServerData from './robotWebServerData.js';

const HttpRequest = async ({ url, method = 'get' }) => {
  try {
    const result = await fetch(url, {
      method,
    });

    if (result.ok) {
      return;
    }
    console.error('HTTP Request Failure:');
    console.error(url);
    console.error(result);
  } catch (e) {
    console.error('HTTP Request Failure:');
    console.error(url);
    console.error(e);
  }
};

export default HttpRequest;

if (esMain(import.meta)) {
  (async () => {
    try {
      const robotWebserverData = await RobotWebServerData();
      const dalekOneConnectInfo = robotWebserverData.find(
        (entry) => entry.name === 'DalekOne',
      );
      await HttpRequest({
        url: `http://${dalekOneConnectInfo.ip}/sendServoToLocation/head/right`,
      });
      await wait(10000);
      await HttpRequest({
        url: `http://${dalekOneConnectInfo.ip}/servo/eyeStalk/-1000`,
      });
      await wait(1000);
      await HttpRequest({
        url: `http://${dalekOneConnectInfo.ip}/servo/eyeStalk/1000`,
      });
      await wait(1000);
      await HttpRequest({
        url: `http://${dalekOneConnectInfo.ip}/servo/eyeStalk/0`,
      });
      await wait(1000);
    } catch (e) {
      console.error(e);
    }
  })();
}
