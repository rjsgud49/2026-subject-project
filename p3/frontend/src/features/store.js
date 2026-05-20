import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import coursesReducer from './coursesSlice';
import cartReducer from './cartSlice';
import enrollmentReducer from './enrollmentSlice';
import playerReducer from './playerSlice';
import qaReducer from './qaSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    courses: coursesReducer,
    cart: cartReducer,
    enrollment: enrollmentReducer,
    player: playerReducer,
    qa: qaReducer,
  },
});
