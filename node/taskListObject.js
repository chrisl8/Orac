const taskList = {
  meditate: {
    interval: 'daily',
    reminderAfterHour: 7,
    reminderAfterMinute: 0,
    repeatInterval: 60, // minutes
    message: 'Meditation',
    speakDo: 'Knock on the sky.',
    speakDone: 'Zen plus plus!',
    completedTexts: ['meditation', 'meditate'],
    trellisButton: 30,
    trellisButtonColor: [0, 0, 255],
    pushoverExpirationTime: 60 * 10,
  },
  vitamin: {
    interval: 'daily',
    reminderAfterHour: 7,
    reminderAfterMinute: 30,
    repeatInterval: 30, // minutes
    message: "Don't forget to take your vitamin today!",
    speakDo: 'Vitamins!',
    speakDone: 'Yummy',
    completedTexts: ['vitamin'],
    trellisButton: 29,
    trellisButtonColor: [0, 255, 0],
    pushoverExpirationTime: 60 * 10,
  },
  pushUps: {
    interval: 'daily',
    reminderAfterHour: 7,
    reminderAfterMinute: 30,
    repeatInterval: 30, // minutes
    message: 'Please do your push ups.',
    speakDo: "Don't forget to do your pushups today.",
    speakDone: 'Pushups done!',
    completedTexts: ['push up', 'pushup', 'push-up'],
    trellisButton: 8,
    trellisButtonColor: [255, 0, 0],
    pushoverExpirationTime: 60 * 10,
  },
  hollowHolds: {
    interval: 'daily',
    reminderAfterHour: 9,
    reminderAfterMinute: 30,
    repeatInterval: 30, // minutes
    message: 'Hollow holds',
    speakDo: 'Crunch time!',
    speakDone: 'Yay!',
    completedTexts: ['crunch', 'hollow hold', 'hollowhold'],
    trellisButton: 9,
    trellisButtonColor: [255, 255, 0],
    pushoverExpirationTime: 60 * 10,
  },
  pullUps: {
    interval: 'daily',
    reminderAfterHour: 10,
    reminderAfterMinute: 30,
    repeatInterval: 30, // minutes
    message: 'Pullups',
    speakDo: 'Hang time!',
    speakDone: 'Who raw!',
    completedTexts: ['pullup', 'pull up'],
    trellisButton: 10,
    trellisButtonColor: [255, 0, 255],
    pushoverExpirationTime: 60 * 10,
  },
  bike: {
    interval: 'daily',
    reminderAfterHour: 12,
    reminderAfterMinute: 0,
    repeatInterval: 1, // minutes
    message: 'Time to do 15 on the bike.',
    speakDo: 'Time for some pedal pushing.',
    speakDone: 'Good job!',
    completedTexts: ['bike'],
    trellisButton: 11,
    trellisButtonColor: [0, 255, 0],
    pushoverExpirationTime: 60 * 10,
  },
};

export default taskList;
