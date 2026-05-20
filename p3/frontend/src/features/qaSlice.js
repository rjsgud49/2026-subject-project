import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';

export const fetchQuestions = createAsyncThunk('qa/fetchByCourse', (courseId) =>
  api.questions.list(Number(courseId))
);
export const fetchQuestionDetail = createAsyncThunk('qa/fetchOne', (questionId) =>
  api.questions.get(Number(questionId))
);
export const createQuestionThunk = createAsyncThunk(
  'qa/create',
  ({ courseId, title, body, is_private }) =>
    api.questions.create(Number(courseId), { title, body, is_private: !!is_private })
);
export const updateQuestionThunk = createAsyncThunk(
  'qa/update',
  ({ questionId, title, body }) => api.questions.update(Number(questionId), { title, body })
);
export const deleteQuestionThunk = createAsyncThunk('qa/delete', (questionId) =>
  api.questions.delete(Number(questionId))
);
export const createAnswerThunk = createAsyncThunk(
  'qa/answer',
  ({ questionId, body }) => api.questions.createAnswer(Number(questionId), { body })
);

const qaSlice = createSlice({
  name: 'qa',
  initialState: {
    byCourse: {},
    current: null,
    status: 'idle',
    message: null,
  },
  reducers: {
    clearQaMessage(state) {
      state.message = null;
    },
    clearCurrentQuestion(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        const courseId = action.meta.arg;
        state.byCourse[courseId] = {
          items: action.payload.items || [],
          total: action.payload.total ?? 0,
        };
      })
      .addCase(fetchQuestionDetail.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(createQuestionThunk.fulfilled, (state) => {
        state.message = { type: 'ok', text: '질문이 등록되었습니다.' };
      })
      .addCase(updateQuestionThunk.fulfilled, (state) => {
        state.message = { type: 'ok', text: '수정되었습니다.' };
      })
      .addCase(deleteQuestionThunk.fulfilled, (state) => {
        state.message = { type: 'ok', text: '삭제되었습니다.' };
        state.current = null;
      })
      .addCase(createAnswerThunk.fulfilled, (state) => {
        state.message = { type: 'ok', text: '답변이 등록되었습니다.' };
      });
  },
});

export const { clearQaMessage, clearCurrentQuestion } = qaSlice.actions;
export default qaSlice.reducer;
