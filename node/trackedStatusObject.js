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
    enteredHomeRadius: true, // Assume is home until we know otherwise
    isHome: true, // Assume is home until we know otherwise
    trackedDevices: {
      sonic_screwdriver: 'home', // Always default to home if not known yet.
    },
  },
  blueDwarf: {
    doors: {
      driver: 'unknown',
      passenger: 'unknown',
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
  homeAssistantConnected: false,
  todo: {},
  activeReminder: null,
};

export default trackedStatusObject;
