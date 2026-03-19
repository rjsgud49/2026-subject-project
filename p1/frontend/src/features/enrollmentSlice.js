import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';

export const fetchEnrollments = createAsyncThunk('enrollment/fetchList', (status) =>
  api.enrollments.list(status)
);
export const enrollThunk = createAsyncThunk('enrollment/enroll', (courseId) =>
  api.enrollments.enroll(courseId)
);
export const enrollManyThunk = createAsyncThunk('enrollment/enrollMany', async (courseIds) => {
  const results = [];
  for (const cid of courseIds) {
    await api.enrollments.enroll(cid);
    results.push(cid);
  }
  return results;
});

const enrollmentSlice = createSlice({
  name: 'enrollment',
  initialState: {
    list: [],
    filter: 'all',
    sort: 'recent',
    status: 'idle',
    checkoutCourseIds: [],
    lastMessage: null,
  },
  reducers: {
    setEnrollmentFilter(state, action) {
      state.filter = action.payload;
    },
    setEnrollmentSort(state, action) {
      state.sort = action.payload;
    },
    setCheckoutCourseIds(state, action) {
      state.checkoutCourseIds = action.payload;
    },
    clearEnrollmentMessage(state) {
      state.lastMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        state.list = action.payload || [];
      })
      .addCase(enrollThunk.fulfilled, (state) => {
        state.lastMessage = { type: 'ok', text: '수강신청이 완료되었습니다.' };
      })
      .addCase(enrollThunk.rejected, (state, action) => {
        state.lastMessage = { type: 'err', text: action.error.message };
      })
      .addCase(enrollManyThunk.fulfilled, (state, action) => {
        state.checkoutCourseIds = action.payload;
        state.lastMessage = { type: 'ok', text: '결제(데모)가 완료되었습니다.' };
      })
      .addCase(enrollManyThunk.rejected, (state, action) => {
        state.lastMessage = { type: 'err', text: action.error.message };
      });
  },
});

export const {
  setEnrollmentFilter,
  setEnrollmentSort,
  setCheckoutCourseIds,
  clearEnrollmentMessage,
} = enrollmentSlice.actions;
export default enrollmentSlice.reducer;
