import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchMedicines = createAsyncThunk('pharmacy/medicines', async (params, { rejectWithValue }) => {
  try { const { data } = await api.get('/medicines', { params }); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchCart = createAsyncThunk('pharmacy/cart', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/cart'); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const addToCart = createAsyncThunk('pharmacy/addToCart', async ({ medicineId, quantity }, { rejectWithValue }) => {
  try { const { data } = await api.post('/cart/add', { medicineId, quantity }); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateCartItem = createAsyncThunk('pharmacy/updateCartItem', async ({ itemId, quantity }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/cart/item/${itemId}`, { quantity }); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const removeFromCart = createAsyncThunk('pharmacy/removeFromCart', async (itemId, { rejectWithValue }) => {
  try { const { data } = await api.delete(`/cart/item/${itemId}`); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createOrder = createAsyncThunk('pharmacy/createOrder', async (orderData, { rejectWithValue }) => {
  try { const { data } = await api.post('/orders', orderData); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createStripeSession = createAsyncThunk('pharmacy/createStripeSession', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/payment/stripe/create-session', data); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchOrders = createAsyncThunk('pharmacy/orders', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/orders'); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const pharmacySlice = createSlice({
  name: 'pharmacy',
  initialState: { medicines: [], cart: null, orders: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedicines.pending, (state) => { state.loading = true; })
      .addCase(fetchMedicines.fulfilled, (state, action) => { state.loading = false; state.medicines = action.payload.medicines; })
      .addCase(fetchMedicines.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchCart.fulfilled, (state, action) => { state.cart = action.payload.cart; })
      .addCase(addToCart.fulfilled, (state, action) => { state.cart = action.payload.cart; })
      .addCase(updateCartItem.fulfilled, (state, action) => { state.cart = action.payload.cart; })
      .addCase(removeFromCart.fulfilled, (state, action) => { state.cart = action.payload.cart; })
      .addCase(createOrder.fulfilled, (state, action) => { state.orders.unshift(action.payload.order); state.cart = null; })
      .addCase(fetchOrders.fulfilled, (state, action) => { state.orders = action.payload.orders; });
  },
});

export default pharmacySlice.reducer;
