// Send message via Pushover API, which is free!
import Push from "pushover-notifications";
import getPushoverConfig from "./getPushoverConfig.js";

const configObject = await getPushoverConfig();

function pushMe(text) {
  const p = new Push({
    user: configObject.USER,
    token: configObject.TOKEN,
  });
  const msg = {
    message: text,
    // sound: personalData.pushover.sound,
    // priority: -1,
  };
  p.send(msg); // Silent with no error reporting
}

export default pushMe;
