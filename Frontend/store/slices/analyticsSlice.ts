import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsApi, Summary, DailyData, CategoryData, MonthlyData, Insight } from '../../lib/api';

interface AnalyticsState {
  summary: Summary | null;
  daily: DailyData[];
  byCategory: CategoryData[];
  monthly: MonthlyData[];
  insights: Insight[];
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  summary: null,
  daily: [],
  byCategory: [],
  monthly: [],
  insights: [],
  loading: false,
  error: null,
};

export const fetchSummary = createAsyncThunk(
  'analytics/summary',
  async (token: string, { rejectWithValue }) => {
    try { return await analyticsApi.getSummary(token); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const fetchAllAnalytics = createAsyncThunk(
  'analytics/fetchAll',
  async ({ token, params }: { token: string; params?: { startDate?: string; endDate?: string } }, { rejectWithValue }) => {
    try {
      const [summary, daily, byCategory, monthly, insights] = await Promise.all([
        analyticsApi.getSummary(token),
        analyticsApi.getDaily(token, params),
        analyticsApi.getByCategory(token, params),
        analyticsApi.getMonthly(token),
        analyticsApi.getInsights(token),
      ]);
      return { summary, daily, byCategory, monthly, insights };
    } catch (e: any) { return rejectWithValue(e.message); }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAnalytics.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchAllAnalytics.fulfilled, (s, a) => {
        s.loading = false;
        s.summary = a.payload.summary;
        s.daily = a.payload.daily;
        s.byCategory = a.payload.byCategory;
        s.monthly = a.payload.monthly;
        s.insights = a.payload.insights;
      })
      .addCase(fetchAllAnalytics.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(fetchSummary.fulfilled, (s, a) => { s.summary = a.payload; });
  },
});

export default analyticsSlice.reducer;