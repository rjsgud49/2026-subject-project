import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';

const initialFilters = {
  q: '',
  category: '',     // 1단계: 면접 방식 (API로 전달)
  jobField: '',     // 2단계: 직무/분야 (클라이언트 필터링)
  difficulty: '',
  min_price: '',
  max_price: '',
  freeOnly: false,
  sort: 'latest',
  page: 1,
  size: 12,
};

export const fetchCourses = createAsyncThunk('courses/fetchList', async (_, { getState }) => {
  const { filters } = getState().courses;
  const p = {
    page: String(filters.page),
    size: String(filters.size),
  };
  if (filters.q) p.q = filters.q;
  if (filters.category) p.category = filters.category;
  if (filters.difficulty) p.difficulty = filters.difficulty;
  if (filters.freeOnly) {
    p.min_price = '0';
    p.max_price = '0';
  } else {
    if (filters.min_price !== '' && filters.min_price != null)
      p.min_price = String(filters.min_price);
    if (filters.max_price !== '' && filters.max_price != null)
      p.max_price = String(filters.max_price);
  }
  if (filters.sort && filters.sort !== 'latest') p.sort = filters.sort;
  return api.courses.list(p);
});

export const fetchCourseDetail = createAsyncThunk('courses/fetchDetail', async (courseId) => {
  return api.courses.get(Number(courseId));
});

const coursesSlice = createSlice({
  name: 'courses',
  initialState: {
    filters: { ...initialFilters },
    items: [],
    total: 0,
    page: 1,
    size: 12,
    listStatus: 'idle',
    listError: null,
    courseDetail: null,
    detailStatus: 'idle',
    detailError: null,
    viewMode: 'grid',
    activeTab: 'intro',
  },
  reducers: {
    setFilter(state, action) {
      const { key, value } = action.payload;
      state.filters[key] = value;
      if (key !== 'page') state.filters.page = 1;
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = { ...initialFilters };
    },
    setPage(state, action) {
      state.filters.page = action.payload;
    },
    setViewMode(state, action) {
      state.viewMode = action.payload;
    },
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },
    clearDetail(state) {
      state.courseDetail = null;
      state.detailStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.items = action.payload.items || [];
        state.total = action.payload.total ?? 0;
        state.page = action.payload.page ?? state.filters.page;
        state.size = action.payload.size ?? state.filters.size;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.listError = action.error.message;
      })
      .addCase(fetchCourseDetail.pending, (state) => {
        state.detailStatus = 'loading';
      })
      .addCase(fetchCourseDetail.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.courseDetail = action.payload;
      })
      .addCase(fetchCourseDetail.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.detailError = action.error.message;
      });
  },
});

export const {
  setFilter,
  setFilters,
  resetFilters,
  setPage,
  setViewMode,
  setActiveTab,
  clearDetail,
} = coursesSlice.actions;
export default coursesSlice.reducer;
