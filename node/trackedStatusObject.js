const trackedStatusObject = {
  keepRunning: true,
  lastPong: new Date(),
  watchBattery: {
    level: null,
    isCharging: null,
    lastNeedToChargeMessageSent: null,
    lastChargingDoneMessageSent: null,
  },
  userLocation: {
    isHome: true, // Assume is home until we know otherwise
    trackedDevices: {
      christens_apple_watch: 'home', // Always default to home if not known yet.
      christens_apple_watch_2: 'home',
      sonicscrewdriver: 'home', // Always default to home if not known yet.
      sonicscrewdriver_2: 'home',
      christens_ipad_2: 'home', // Always default to home if not known yet.
      christens_ipad_3: 'home',
      // amazon_kindle_fire: 'home', // Not using this one.
      christens_ipad: 'home', // Always default to home if not known yet.
      sonic_screwdriver: 'home', // Always default to home if not known yet.
      cooper_s: 'home', // Always default to home if not known yet.
    },
  },
  officeLights: {
    wallSwitchOff: false,
    on: null,
    onSince: new Date(),
    facing_back_yard: null,
    facing_closset: null,
    facing_door: null,
    facing_me: null,
  },
};

export default trackedStatusObject;
