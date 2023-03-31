/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../api/client';
import perSiteSettings from '../utils/perSiteSettings';

const name = 'jobs';

const initialState = {
  results: {
    data: [],
    status: 'idle',
    error: null,
  },
};

export const fetchResults = createAsyncThunk(
  `${name}/fetchResults`,
  async () => {
    const response = await client.get(`${perSiteSettings.apiURL}jobs/list`);
    return response.data;
  },
);

const jobsSlice = createSlice({
  name,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchResults.pending, (state) => {
        state.results.status = 'loading';
      })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.results.status = 'succeeded';
        state.results.error = null;
        // Replace existing data with new data
        state.results.data = action.payload;
      })
      .addCase(fetchResults.rejected, (state, action) => {
        state.results.status = 'failed';
        state.results.error = action.error.message;
      });
  },
});

export default jobsSlice.reducer;

export const selectResultsData = (state) => state[name].results.data;

export const selectDetailsById = (state, id) =>
  state[name].results.data.find((entry) => entry.id === id);
