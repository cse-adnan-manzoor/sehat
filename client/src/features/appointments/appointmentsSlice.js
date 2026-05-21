import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchAppointments = createAsyncThunk('appointments/fetchAll', async (params, { rejectWithValue }) => {
  try { const { data } = await api.get('/appointments', { params }); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createAppointment = createAsyncThunk('appointments/create', async (appointmentData, { rejectWithValue }) => {
  try { const { data } = await api.post('/appointments', appointmentData); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const cancelAppointment = createAsyncThunk('appointments/cancel', async (id, { rejectWithValue }) => {
  try { const { data } = await api.put(`/appointments/${id}/cancel`); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState: { list: [], current: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => { state.loading = true; })
      .addCase(fetchAppointments.fulfilled, (state, action) => { state.loading = false; state.list = action.payload.appointments; })
      .addCase(fetchAppointments.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createAppointment.fulfilled, (state, action) => { state.list.unshift(action.payload.appointment); })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        const idx = state.list.findIndex(a => a.id === action.payload.appointment.id);
        if (idx !== -1) state.list[idx] = action.payload.appointment;
      });
  },
});

export default appointmentsSlice.reducer;
