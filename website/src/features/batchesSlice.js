/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../api/client';
import perSiteSettings from '../utils/perSiteSettings';

const name = 'batches';

const initialState = {
  results: {
    id: null,
    data: [],
    status: 'idle',
    error: null,
  },
  details: {
    id: null,
    data: [],
    status: 'idle',
    error: null,
  },
};

export const fetchResults = createAsyncThunk(
  `${name}/fetchResults`,
  async (id) => {
    const response = await client.get(
      `${perSiteSettings.apiURL}jobs/results/${id}`,
    );
    return response.data;
  },
);

export const fetchResultDetails = createAsyncThunk(
  `${name}/fetchResultDetails`,
  async (id) => {
    const response = await client.get(
      `${perSiteSettings.apiURL}jobs/result-details/${id}`,
    );
    return response.data;
  },
);

const batchesSlice = createSlice({
  name,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchResults.pending, (state) => {
        state.results.status = 'loading';
      })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.results.id = action.payload.jobId;
        // Replace existing data with new data
        state.results.data = action.payload.data;
        state.results.status = 'succeeded';
        state.results.error = null;
      })
      .addCase(fetchResults.rejected, (state, action) => {
        state.results.status = 'failed';
        state.results.error = action.error.message;
      })

      .addCase(fetchResultDetails.pending, (state) => {
        state.details.status = 'loading';
      })
      .addCase(fetchResultDetails.fulfilled, (state, action) => {
        state.details.id = action.payload.resultId;
        state.details.data = action.payload.data;
        state.details.status = 'succeeded';
        state.details.error = null;
        // Replace existing data with new data
      })
      .addCase(fetchResultDetails.rejected, (state, action) => {
        state.details.status = 'failed';
        state.details.error = action.error.message;
      });
  },
});

export default batchesSlice.reducer;

export const selectResultsData = (state) => state[name].results.data;

export const selectResultDetailsData = (state) => state[name].details.data;
