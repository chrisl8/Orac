/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../api/client';
import perSiteSettings from '../utils/perSiteSettings';

const name = 'devices';

const initialState = {
  results: {
    id: null,
    source: null,
    data: [],
    status: 'idle',
    error: null,
  },
};

export const fetchResults = createAsyncThunk(
  `${name}/fetchResults`,
  async (id) => {
    const response = await client.get(
      `${perSiteSettings.apiURL}devices/list/${id}`,
    );
    return response.data;
  },
);

const devicesSlice = createSlice({
  name,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchResults.pending, (state) => {
        state.results.status = 'loading';
      })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.results.id = action.payload.id;
        // Replace existing data with new data
        state.results.data = action.payload.devices;
        state.results.source = action.payload.source;
        state.results.status = 'succeeded';
        state.results.error = null;
      })
      .addCase(fetchResults.rejected, (state, action) => {
        state.results.status = 'failed';
        state.results.error = action.error.message;
      });
  },
});

export default devicesSlice.reducer;

export const selectResultsData = (state) => state[name].results.data;

export const selectDetailsById = (state, id) =>
  state[name].results.data.find((entry) => entry.id === id);
