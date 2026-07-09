import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  expensesApi,
  Expense,
  ExpenseFilters,
  PaginatedExpenses,
} from "../../lib/api";

interface ExpensesState {
  items: Expense[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: ExpensesState = {
  items: [],
  pagination: null,
  loading: false,
  error: null,
};

export const fetchExpenses = createAsyncThunk(
  "expenses/fetchAll",
  async (
    { token, filters }: { token: string; filters?: ExpenseFilters },
    { rejectWithValue },
  ) => {
    try {
      return await expensesApi.getAll(token, filters);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  },
);

export const createExpense = createAsyncThunk(
  "expenses/create",
  async (
    { token, data }: { token: string; data: any },
    { rejectWithValue },
  ) => {
    try {
      return await expensesApi.create(token, data);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  },
);

export const updateExpense = createAsyncThunk(
  "expenses/update",
  async (
    { token, id, data }: { token: string; id: string; data: any },
    { rejectWithValue },
  ) => {
    try {
      return await expensesApi.update(token, id, data);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  },
);

export const deleteExpense = createAsyncThunk(
  "expenses/delete",
  async ({ token, id }: { token: string; id: string }, { rejectWithValue }) => {
    try {
      await expensesApi.delete(token, id);
      return id;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  },
);

const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (s, a) => {
        s.loading = false;
        const payload = a.payload as any;
        if (payload && payload.data && payload.pagination) {
          s.items = payload.data;
          s.pagination = payload.pagination;
        } else if (Array.isArray(payload)) {
          s.items = payload;
        } else {
          s.items = payload?.data || [];
          s.pagination = payload?.pagination || null;
        }
      })
      .addCase(fetchExpenses.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })
      .addCase(createExpense.fulfilled, (s, a) => {
        s.items.unshift(a.payload);
      })
      .addCase(updateExpense.fulfilled, (s, a) => {
        const idx = s.items.findIndex((e) => e._id === a.payload._id);
        if (idx !== -1) s.items[idx] = a.payload;
      })
      .addCase(deleteExpense.fulfilled, (s, a) => {
        s.items = s.items.filter((e) => e._id !== a.payload);
      });
  },
});

export default expensesSlice.reducer;
