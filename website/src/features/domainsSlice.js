/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../api/client';
import perSiteSettings from '../utils/perSiteSettings';

const name = 'domains';

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
    const response = await client.get(
      `${perSiteSettings.apiURL}admin/permissions/domains`,
    );
    return response.data;
  },
);

const domainsSlice = createSlice({
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
      });
  },
});

export default domainsSlice.reducer;

export const selectAllDetails = (state) => state[name].details.data;

export const selectDetailsById = (state, id) =>
  state[name].details.data.find((entry) => entry.id === id);
