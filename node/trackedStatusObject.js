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
    enteredHomeRadius: false,
    isHome: true, // Assume is home until we know otherwise
    trackedDevices: {
      sonicscrewdriver: 'home', // Always default to home if not known yet.
      sonicscrewdriver_2: 'home',
      sonic_screwdriver: 'home',
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
  wled: {
    on: false,
  },
  trellisButtons: [],
};

export default trackedStatusObject;
