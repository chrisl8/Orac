/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../api/client';
import perSiteSettings from '../utils/perSiteSettings';

const name = 'logs';

const initialState = {
  details: {
    data: [],
    status: 'idle',
    error: null,
    update: {
      status: 'idle',
      error: null,
    },
  },
  variables: { data: [], status: 'idle', error: null },
  groups: { data: [], status: 'idle', error: null },
  ansibleInstances: { data: [], status: 'idle', error: null },
  processors: { data: [], status: 'idle', error: null },
};

export const fetchDetails = createAsyncThunk(
  `${name}/fetchDetails`,
  async () => {
    const response = await client.get(`${perSiteSettings.apiURL}${name}`);
    return response.data;
  },
);

export const updateDetails = createAsyncThunk(
  `${name}/update`,
  async (data) => {
    const response = await client.post(
      `${perSiteSettings.apiURL}admin/${name}/${data.id}/details`,
      data,
    );
    return response.data;
  },
);

export const fetchAnsibleInstances = createAsyncThunk(
  `${name}/fetchAnsibleInstances`,
  async () => {
    const response = await client.get(
      `${perSiteSettings.apiURL}admin/ansible-instances`,
    );
    return response.data;
  },
);

export const fetchProcessors = createAsyncThunk(
  `${name}/fetchProcessors`,
  async () => {
    const response = await client.get(
      `${perSiteSettings.apiURL}admin/automation-processors`,
    );
    return response.data;
  },
);

const logsSlice = createSlice({
  name,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchDetails.pending, (state) => {
        state.details.status = 'loading';
      })
      .addCase(fetchDetails.fulfilled, (state, action) => {
        state.details.status = 'succeeded';
        state.details.error = null;
        // Replace existing data with new data
        state.details.data = action.payload;
      })
      .addCase(fetchDetails.rejected, (state, action) => {
        state.details.status = 'failed';
        state.details.error = action.error.message;
      })

      .addCase(updateDetails.pending, (state) => {
        state.details.update.status = 'loading';
      })
      .addCase(updateDetails.fulfilled, (state) => {
        state.details.update.status = 'succeeded';
        state.details.update.error = null;
        // TODO: In theory we should receive the new row data after we update it rather than requiring a reload
        //       from the component itself.
        // state.details.update.data = action.payload;
      })
      .addCase(updateDetails.rejected, (state, action) => {
        state.details.update.status = 'failed';
        state.details.update.error = action.error.message;
      })

      .addCase(fetchAnsibleInstances.pending, (state) => {
        state.ansibleInstances.status = 'loading';
      })
      .addCase(fetchAnsibleInstances.fulfilled, (state, action) => {
        state.ansibleInstances.status = 'succeeded';
        state.ansibleInstances.error = null;
        // Replace existing data with new data
        state.ansibleInstances.data = action.payload;
      })
      .addCase(fetchAnsibleInstances.rejected, (state, action) => {
        state.ansibleInstances.status = 'failed';
        state.ansibleInstances.error = action.error.message;
      })

      .addCase(fetchProcessors.pending, (state) => {
        state.processors.status = 'loading';
      })
      .addCase(fetchProcessors.fulfilled, (state, action) => {
        state.processors.status = 'succeeded';
        state.processors.error = null;
        // Replace existing data with new data
        state.processors.data = action.payload;
      })
      .addCase(fetchProcessors.rejected, (state, action) => {
        state.processors.status = 'failed';
        state.processors.error = action.error.message;
      });
  },
});

export default logsSlice.reducer;

export const selectAllDetails = (state) => state[name].details.data;

export const selectAllAnsibleInstances = (state) =>
  state[name].ansibleInstances.data;

export const selectAllProcessors = (state) => state[name].processors.data;

export const selectDetailsById = (state, id) =>
  state[name].details.data.find((entry) => entry.id === id);
