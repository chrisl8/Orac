const trackedStatusObject = {
  lastPong: new Date(),
  watchBattery: {
    level: null,
    isCharging: null,
    lastNeedToChargeMessageSent: null,
    lastCharginDoneMessageSent: null,
  },
  userLocation: {
    isHome: true, // Assume is home until we know otherwise
    trackedDevices: {
      christens_apple_watch: 'home', // Always default to home if not known yet.
      sonicscrewdriver: 'home', // Always default to home if not known yet.
      christens_ipad_2: 'home', // Always default to home if not known yet.
      // amazon_kindle_fire: 'home', // Not using this one.
      christens_ipad: 'home', // Always default to home if not known yet.
      sonic_screwdriver: 'home', // Always default to home if not known yet.
      cooper_s: 'home', // Always default to home if not known yet.
    },
  },
  officeLights: {
    wallSwitchOff: false,
    on: null,
    facing_back_yard: null,
    facing_closset: null,
    facing_door: null,
    facing_me: null,
  },
};

export default trackedStatusObject;
