import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchDoctors = createAsyncThunk('doctors/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/doctors', { params });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchDoctor = createAsyncThunk('doctors/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/doctors/${id}`);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchSpecialties = createAsyncThunk('doctors/specialties', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/doctors/specialties');
    return data.specialties;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState: { list: [], current: null, specialties: [], pagination: null, loading: false, error: null },
  reducers: { clearCurrent: (state) => { state.current = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => { state.loading = true; })
      .addCase(fetchDoctors.fulfilled, (state, action) => { state.loading = false; state.list = action.payload.doctors; state.pagination = action.payload.pagination; })
      .addCase(fetchDoctors.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchDoctor.pending, (state) => { state.loading = true; })
      .addCase(fetchDoctor.fulfilled, (state, action) => { state.loading = false; state.current = action.payload.doctor; })
      .addCase(fetchDoctor.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchSpecialties.fulfilled, (state, action) => { state.specialties = action.payload; });
  },
});

export const { clearCurrent } = doctorsSlice.actions;
export default doctorsSlice.reducer;
