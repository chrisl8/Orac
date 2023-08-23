const taskList = {
  pushUps: {
    interval: 'daily',
    reminderAfterHour: 7,
    reminderAfterMinute: 30,
    repeatInterval: 30, // minutes
    message: 'Please do your push ups. -RED- 8',
    speakDo: "Don't forget to do your pushups today.",
    speakDone: 'Pushups done!',
    completedTexts: ['push ups'],
    trellisButton: 8,
    trellisButtonColor: [255, 0, 0],
  },
  bike: {
    interval: 'daily',
    reminderAfterHour: 12,
    reminderAfterMinute: 0,
    repeatInterval: 15, // minutes
    message: 'Time to do 15 on the bike. -green- 9',
    speakDo: 'Time for some pedal pushing.',
    speakDone: 'Good job!',
    completedTexts: ['bike'],
    trellisButton: 9,
    trellisButtonColor: [0, 255, 0],
  },
  meditate: {
    interval: 'daily',
    reminderAfterHour: 7,
    reminderAfterMinute: 0,
    repeatInterval: 60, // minutes
    message: 'Meditation. -Blue- 30',
    speakDo: 'Knock on the sky.',
    speakDone: 'Zen plus plus!',
    completedTexts: ['meditation'],
    trellisButton: 30,
    trellisButtonColor: [0, 0, 255],
  },
};

export default taskList;
