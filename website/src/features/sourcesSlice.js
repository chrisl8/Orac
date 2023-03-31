/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../api/client';
import perSiteSettings from '../utils/perSiteSettings';

const name = 'sources';

const initialState = {
  details: {
    data: [],
    status: 'idle',
    error: null,
  },
  fields: { data: [], status: 'idle', error: null },
};

export const fetchDetails = createAsyncThunk(
  `${name}/fetchDetails`,
  async () => {
    const response = await client.get(`${perSiteSettings.apiURL}admin/sources`);
    return response.data;
  },
);

export const fetchFields = createAsyncThunk(`${name}/fetchFields`, async () => {
  const response = await client.get(
    `${perSiteSettings.apiURL}admin/source-fields`,
  );
  return response.data;
});

const sourcesSlice = createSlice({
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
      .addCase(fetchFields.pending, (state) => {
        state.fields.status = 'loading';
      })
      .addCase(fetchFields.fulfilled, (state, action) => {
        state.fields.status = 'succeeded';
        state.fields.error = null;
        // Replace existing data with new data
        state.fields.data = action.payload;
      })
      .addCase(fetchFields.rejected, (state, action) => {
        state.fields.status = 'failed';
        state.fields.error = action.error.message;
      });
  },
});

export default sourcesSlice.reducer;

export const selectAllDetails = (state) => state[name].details.data;

export const selectDetailsById = (state, id) =>
  state[name].details.data.find((entry) => entry.id === id);

export const selectFieldsById = (state, id) =>
  state[name].fields.data.filter((entry) => entry.source_id === id);
