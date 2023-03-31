/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../api/client';
import perSiteSettings from '../utils/perSiteSettings';

const name = 'playbooks';

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
  processing: { data: [], status: 'idle', error: null },
  automations: { data: [], status: 'idle', error: null },
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

const playbooksSlice = createSlice({
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
      });
  },
});

export default playbooksSlice.reducer;

export const selectAllDetails = (state) => state[name].details.data;

export const selectDetailsById = (state, id) =>
  state[name].details.data.find((entry) => entry.id === id);
