import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';

export const fetchCart = createAsyncThunk('cart/fetch', () => api.cart.list());

export const addToCartThunk = createAsyncThunk('cart/add', async (courseId) => {
  await api.cart.add(courseId);
  return api.cart.list();
});

export const removeFromCartThunk = createAsyncThunk('cart/remove', async (courseId) => {
  await api.cart.remove(courseId);
  return api.cart.list();
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    lastAction: null,
  },
  reducers: {
    clearCartMessage(state) {
      state.lastAction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = Array.isArray(action.payload) ? action.payload : [];
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
        state.items = [];
      })
      .addCase(addToCartThunk.pending, (state) => {
        state.lastAction = null;
      })
      .addCase(addToCartThunk.fulfilled, (state, action) => {
        state.items = Array.isArray(action.payload) ? action.payload : [];
        state.status = 'succeeded';
        state.lastAction = { type: 'success', msg: '장바구니에 담았습니다.' };
      })
      .addCase(addToCartThunk.rejected, (state, action) => {
        state.lastAction = { type: 'error', msg: action.error.message };
      })
      .addCase(removeFromCartThunk.fulfilled, (state, action) => {
        state.items = Array.isArray(action.payload) ? action.payload : [];
        state.status = 'succeeded';
      })
      .addCase(removeFromCartThunk.rejected, (state, action) => {
        state.lastAction = { type: 'error', msg: action.error.message };
      });
  },
});

export const { clearCartMessage } = cartSlice.actions;
export default cartSlice.reducer;
