import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';

export const fetchCart = createAsyncThunk('cart/fetch', () => api.cart.list());
export const addToCartThunk = createAsyncThunk('cart/add', (courseId) => api.cart.add(courseId));
export const removeFromCartThunk = createAsyncThunk('cart/remove', (courseId) =>
  api.cart.remove(courseId)
);

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
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload || [];
        state.status = 'succeeded';
      })
      .addCase(addToCartThunk.fulfilled, (state) => {
        state.lastAction = { type: 'success', msg: '장바구니에 담았습니다.' };
      })
      .addCase(addToCartThunk.rejected, (state, action) => {
        state.lastAction = { type: 'error', msg: action.error.message };
      })
      .addCase(removeFromCartThunk.fulfilled, (state, action) => {
        const id = action.meta.arg;
        state.items = state.items.filter((x) => x.course_id !== id);
      });
  },
});

export const { clearCartMessage } = cartSlice.actions;
export default cartSlice.reducer;
