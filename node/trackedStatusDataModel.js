import _ from 'lodash';
import { EventEmitter } from 'events';

import trackedStatusObject from './trackedStatusObject.js';

trackedStatusObject.status = 'Online';

const statusEmitter = new EventEmitter();

// At this moment, the only consumer of the robotModelEmitter update
// is the web server, and we don't want to overwhelm the network
// with updates.
// If we find this debounce is too long/short, we could
// move it to the webserver end, and change/remove it here.
// At the moment, it seems smart to "emit" fewer events,
// rather than emit them like crazy, and debounce them,
// on the other end.
const debounceCheckAndUpdateFriends = _.debounce(() => {
  statusEmitter.emit('update');
}, 300);

// There is no prohibition on updating the robotModel directly,
// but if you want other tools to act on this update,
// such as the front end website being updated,
// then pass the update to this updater instead.
const updateStatus = (path, value) => {
  const currentValue = _.get(trackedStatusObject, path);
  if (currentValue !== value) {
    _.set(trackedStatusObject, path, value);
    debounceCheckAndUpdateFriends();
  }
};

// You can also just call this to ensure an update happens
const updateRobotModel = () => {
  debounceCheckAndUpdateFriends();
};

export { trackedStatusObject, statusEmitter, updateStatus, updateRobotModel };
