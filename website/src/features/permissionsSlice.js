/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../api/client';
import perSiteSettings from '../utils/perSiteSettings';

const name = 'permissions';

const initialState = {
  functions: {
    data: [],
    status: 'idle',
    error: null,
    update: {
      status: 'idle',
      error: null,
    },
  },
  roles: {
    data: [],
    status: 'idle',
    error: null,
    update: {
      status: 'idle',
      error: null,
    },
  },
  domains: {
    data: [],
    status: 'idle',
    error: null,
    update: {
      status: 'idle',
      error: null,
    },
  },
};

export const fetchFunctions = createAsyncThunk(
  `${name}/fetchFunctions`,
  async () => {
    const response = await client.get(
      `${perSiteSettings.apiURL}admin/${name}/functions`,
    );
    return response.data;
  },
);

export const fetchRoles = createAsyncThunk(`${name}/fetchRoles`, async () => {
  const response = await client.get(
    `${perSiteSettings.apiURL}admin/${name}/roles`,
  );
  return response.data;
});

export const fetchDomains = createAsyncThunk(
  `${name}/fetchDomains`,
  async () => {
    const response = await client.get(
      `${perSiteSettings.apiURL}admin/${name}/domains`,
    );
    return response.data;
  },
);

const permissionsSlice = createSlice({
  name,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchFunctions.pending, (state) => {
        state.functions.status = 'loading';
      })
      .addCase(fetchFunctions.fulfilled, (state, action) => {
        state.functions.status = 'succeeded';
        state.functions.error = null;
        // Replace existing data with new data
        state.functions.data = action.payload;
      })
      .addCase(fetchFunctions.rejected, (state, action) => {
        state.functions.status = 'failed';
        state.functions.error = action.error.message;
      })

      .addCase(fetchRoles.pending, (state) => {
        state.roles.status = 'loading';
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.roles.status = 'succeeded';
        state.roles.error = null;
        // Replace existing data with new data
        state.roles.data = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.roles.status = 'failed';
        state.roles.error = action.error.message;
      })

      .addCase(fetchDomains.pending, (state) => {
        state.domains.status = 'loading';
      })
      .addCase(fetchDomains.fulfilled, (state, action) => {
        state.domains.status = 'succeeded';
        state.domains.error = null;
        // Replace existing data with new data
        state.domains.data = action.payload;
      })
      .addCase(fetchDomains.rejected, (state, action) => {
        state.domains.status = 'failed';
        state.domains.error = action.error.message;
      });
  },
});

export default permissionsSlice.reducer;

export const selectAllFunctions = (state) => state[name].functions.data;

export const selectFunctionDetailsById = (state, id) =>
  state[name].functions.data.find((entry) => entry.id === id);

export const selectAllRoles = (state) => state[name].roles.data;

export const selectRoleDetailsById = (state, id) =>
  state[name].roles.data.find((entry) => entry.id === id);

export const selectAllDomains = (state) => state[name].domains.data;

export const selectDomainDetailsById = (state, id) =>
  state[name].domains.data.find((entry) => entry.id === id);
