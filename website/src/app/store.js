import { configureStore } from '@reduxjs/toolkit';

import sourcesSlice from '../features/sourcesSlice';
import domainsSlice from '../features/domainsSlice';
import devicesSlice from '../features/devicesSlice';
import automationsSlice from '../features/automationsSlice';
import passwordsSlice from '../features/passwordsSlice';
import groupsSlice from '../features/groupsSlice';
import batchesSlice from '../features/batchesSlice';
import jobsSlice from '../features/jobsSlice';
import playbooksSlice from '../features/playbooksSlice';
import permissionsSlice from '../features/permissionsSlice';
import logsSlice from '../features/logsSlice';

import listenerMiddleware from '../features/middleware/groupUpdateListener';

export default configureStore({
  reducer: {
    sources: sourcesSlice,
    domains: domainsSlice,
    devices: devicesSlice,
    groups: groupsSlice,
    automations: automationsSlice,
    passwords: passwordsSlice,
    jobs: jobsSlice,
    batches: batchesSlice,
    playbooks: playbooksSlice,
    permissions: permissionsSlice,
    logs: logsSlice,
  },
  // Add the listener middleware to the store.
  // NOTE: Since this can receive actions with functions inside,
  // it should go before the serializability check middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});
