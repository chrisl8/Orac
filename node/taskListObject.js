/*
Neopixel color helps
https://learn.adafruit.com/adafruit-kb2040/neopixel-led

red: (255, 0, 0)
green: (0, 255, 0)
blue: (0, 0, 255)
cyan: (0, 255, 255)
purple: (255, 0, 255)
yellow: (255, 255, 0)
white: (255, 255, 255)
black (off): (0, 0, 0)
 */
const taskList = {
  meditate: {
    interval: 'daily',
    reminderAfterHour: 8,
    reminderAfterMinute: 0,
    repeatInterval: 60, // minutes
    todoListEntryText: 'Meditate',
    message: 'Meditation',
    completedTexts: ['meditation', 'meditate'],
    trellisButton: 30,
    trellisButtonColor: [0, 0, 255],
    pushoverExpirationTime: 60 * 10,
    daysOfTheWeek: [1, 2, 3, 4, 5],
  },
  vitamin: {
    interval: 'daily',
    reminderAfterHour: 8,
    reminderAfterMinute: 30,
    repeatInterval: 90, // minutes
    todoListEntryText: 'Take Daily Vitamin',
    message: "Don't forget to take your vitamin today!",
    completedTexts: ['vitamin'],
    trellisButton: 29,
    trellisButtonColor: [0, 255, 0],
    pushoverExpirationTime: 60 * 10,
  },
  pushUps: {
    interval: 'daily',
    reminderAfterHour: 9,
    reminderAfterMinute: 0,
    repeatInterval: 90, // minutes
    message: 'Please do your push ups.',
    completedTexts: ['push up', 'pushup', 'push-up'],
    trellisButton: 8,
    trellisButtonColor: [255, 0, 0],
    pushoverExpirationTime: 60 * 10,
    daysOfTheWeek: [1, 2, 3, 4, 5],
  },
  hollowHolds: {
    interval: 'daily',
    reminderAfterHour: 9,
    reminderAfterMinute: 30,
    repeatInterval: 90, // minutes
    message: 'Hollow holds',
    completedTexts: ['crunch', 'hollow hold', 'hollowhold'],
    trellisButton: 9,
    trellisButtonColor: [255, 255, 0],
    pushoverExpirationTime: 60 * 10,
    daysOfTheWeek: [1, 2, 3, 4, 5],
  },
  chargeWatch: {
    interval: 'daily',
    reminderAfterHour: 10,
    reminderAfterMinute: 0,
    repeatInterval: 60 * 4, // minutes
    message: 'Charge Watch',
    completedTexts: ['charg'],
    trellisButton: 6,
    trellisButtonColor: [255, 255, 125],
    pushoverExpirationTime: 60 * 60 * 4, // seconds
    daysOfTheWeek: [1, 2, 3, 4, 5],
  },
  pullUps: {
    interval: 'daily',
    reminderAfterHour: 10,
    reminderAfterMinute: 30,
    repeatInterval: 90, // minutes
    message: 'Pullups',
    completedTexts: ['pullup', 'pull up'],
    trellisButton: 10,
    trellisButtonColor: [255, 0, 255],
    pushoverExpirationTime: 60 * 10,
    daysOfTheWeek: [1, 2, 3, 4, 5],
  },
  putOnWatch: {
    interval: 'daily',
    reminderAfterHour: 11,
    reminderAfterMinute: 0,
    repeatInterval: 60, // minutes
    message: 'Wear Watch',
    completedTexts: ['wear'],
    trellisButton: 7,
    trellisButtonColor: [0, 255, 255],
    pushoverExpirationTime: 60 * 30, // seconds
    daysOfTheWeek: [1, 2, 3, 4, 5],
  },
  bike: {
    interval: 'daily',
    reminderAfterHour: 12,
    reminderAfterMinute: 0,
    repeatInterval: 90, // minutes
    message: 'Time to do 15 on the bike.',
    completedTexts: ['bike'],
    trellisButton: 11,
    trellisButtonColor: [0, 255, 0],
    pushoverExpirationTime: 60 * 10,
    daysOfTheWeek: [1, 2, 3, 4, 5],
  },
};

export default taskList;
