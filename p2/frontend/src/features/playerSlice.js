import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';

export const loadPlayer = createAsyncThunk(
  'player/load',
  async (enrollmentId, { dispatch }) => {
    const enrollment = await api.enrollments.get(Number(enrollmentId));
    const progress = await api.enrollments.getProgress(Number(enrollmentId));
    return { enrollment, progress };
  }
);

export const saveVideoProgressThunk = createAsyncThunk(
  'player/saveProgress',
  async ({ enrollmentId, videoId, lastSecond, completed }) => {
    await api.enrollments.updateProgress(Number(enrollmentId), Number(videoId), {
      last_second: lastSecond,
      completed,
    });
    return { videoId, lastSecond, completed };
  }
);

const pickInitialVideo = (enrollment) => {
  const sections = enrollment?.course?.sections ?? [];
  let pick = null;
  if (enrollment?.last_video_id) {
    for (const s of sections) {
      const v = (s.videos || []).find((x) => x.id === enrollment.last_video_id);
      if (v) {
        pick = { ...v, sectionTitle: s.title };
        break;
      }
    }
  }
  if (!pick) {
    for (const s of sections) {
      const v = (s.videos || [])[0];
      if (v) {
        pick = { ...v, sectionTitle: s.title };
        break;
      }
    }
  }
  return pick;
};

const playerSlice = createSlice({
  name: 'player',
  initialState: {
    enrollmentId: null,
    enrollment: null,
    progress: [],
    currentVideo: null,
    playbackRate: 1,
    status: 'idle',
    error: null,
  },
  reducers: {
    setCurrentVideo(state, action) {
      state.currentVideo = action.payload;
    },
    setPlaybackRate(state, action) {
      state.playbackRate = action.payload;
    },
    updateLocalProgress(state, action) {
      const { videoId, lastSecond, completed } = action.payload;
      const idx = state.progress.findIndex((p) => p.video_id === videoId);
      const row = { video_id: videoId, last_second: lastSecond, completed };
      if (idx >= 0) state.progress[idx] = { ...state.progress[idx], ...row };
      else state.progress.push(row);
    },
    resetPlayer(state) {
      state.enrollmentId = null;
      state.enrollment = null;
      state.progress = [];
      state.currentVideo = null;
      state.playbackRate = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPlayer.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadPlayer.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.enrollment = action.payload.enrollment;
        state.progress = action.payload.progress || [];
        state.enrollmentId = action.payload.enrollment?.id;
        state.currentVideo = pickInitialVideo(action.payload.enrollment);
      })
      .addCase(loadPlayer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { setCurrentVideo, setPlaybackRate, updateLocalProgress, resetPlayer } =
  playerSlice.actions;
export default playerSlice.reducer;
