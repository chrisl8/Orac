import persistentData from './persistentKeyValuePairs.js';
import { trackedStatusObject, updateStatus } from './trackedStatusDataModel.js';
import taskListObject from './taskListObject.js';
import trellis from './trellis.js';
import playWav from './playWav.js';
import wait from './wait.js';

const completed = async (taskName) => {
  const taskData = taskListObject[taskName];

  // Update the public status
  updateStatus(`todo.${taskName}`, {
    pending: false,
  });

  // Unset active reminder if this was it
  const activeReminder = await persistentData.get('activeReminder');
  if (activeReminder.value === taskName) {
    await persistentData.del('activeReminder');
  }

  await persistentData.set(`${taskName}-LastDoneTime`);
  console.log(`${taskName} has been completed.`);
  if (trackedStatusObject.officeLights.on) {
    playWav({ shortFileName: 'CastleInTheSky-RobotBeep2a' });
  }
  // Turn off the light if it was on
  trellis.toggleButton({ button: taskData.trellisButton, color: [0, 0, 0] });
  await wait(50);
};

export default { completed };
