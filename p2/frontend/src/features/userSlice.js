import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_USER_ID, SESSION_KEY } from '../utils/constants';

function loadSession() {
  try {
    const r = localStorage.getItem(SESSION_KEY);
    if (!r) return null;
    const u = JSON.parse(r);
    if (u && u.id == null) u.id = DEFAULT_USER_ID;
    return u;
  } catch {
    return null;
  }
}

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: loadSession(),
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      if (action.payload)
        localStorage.setItem(SESSION_KEY, JSON.stringify(action.payload));
      else localStorage.removeItem(SESSION_KEY);
    },
    logout(state) {
      state.user = null;
      localStorage.removeItem(SESSION_KEY);
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
