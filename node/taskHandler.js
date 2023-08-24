import persistentData from './persistentKeyValuePairs.js';
import isToday from './dateIsToday.js';
import { trackedStatusObject } from './trackedStatusDataModel.js';
import speak from './speak.js';
import taskListObject from './taskListObject.js';
import trellis from './trellis.js';

const completed = async (taskName) => {
  const taskData = taskListObject[taskName];
  const lastDone = await persistentData.get(`${taskName}-LastDoneTime`);
  const lastReminder = await persistentData.get(`${taskName}-LastReminderTime`);
  // Don't do anything if this was already done today
  // Or if there was no reminder yet today (wrong button?)
  if (
    isToday(new Date(lastReminder.timestamp)) &&
    !isToday(new Date(lastDone.timestamp))
  ) {
    persistentData.set(`${taskName}-LastDoneTime`);
    console.log(`${taskName} has been completed.`);
    if (trackedStatusObject.officeLights.on && taskData.speakDone) {
      speak(taskData.speakDone);
    }
  }
  // Except turn off the light if it was on
  trellis.toggleButton({ button: taskData.trellisButton, color: [0, 0, 0] });
};

export default { completed };
