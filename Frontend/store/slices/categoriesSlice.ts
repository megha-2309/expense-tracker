import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoriesApi, Category } from '../../lib/api';

interface CategoriesState {
  items: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = { items: [], loading: false, error: null };

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (token: string, { rejectWithValue }) => {
    try { return await categoriesApi.getAll(token); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async ({ token, data }: { token: string; data: { name: string; icon: string; color: string } }, { rejectWithValue }) => {
    try { return await categoriesApi.create(token, data); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ token, id, data }: { token: string; id: string; data: { name: string; icon: string; color: string } }, { rejectWithValue }) => {
    try { return await categoriesApi.update(token, id, data); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async ({ token, id }: { token: string; id: string }, { rejectWithValue }) => {
    try { await categoriesApi.delete(token, id); return id; }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchCategories.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchCategories.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(createCategory.fulfilled, (s, a) => { s.items.unshift(a.payload); })
      .addCase(updateCategory.fulfilled, (s, a) => {
        const idx = s.items.findIndex(c => c._id === a.payload._id);
        if (idx !== -1) s.items[idx] = a.payload;
      })
      .addCase(deleteCategory.fulfilled, (s, a) => {
        s.items = s.items.filter(c => c._id !== a.payload);
      });
  },
});

export default categoriesSlice.reducer;