import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../../lib/api";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: true,
  error: null,
};

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (creds: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await authApi.login(creds);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  },
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (
    data: { name: string; email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      return await authApi.register(data);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    initAuth(state) {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("spendly_token");
        const user = localStorage.getItem("spendly_user");
        if (token && user) {
          try {
            state.token = token;
            state.user = JSON.parse(user);
          } catch {
            state.token = null;
            state.user = null;
            localStorage.removeItem("spendly_token");
            localStorage.removeItem("spendly_user");
          }
        }
      }
      state.loading = false;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("spendly_token");
        localStorage.removeItem("spendly_user");
      }
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handleAuth = (
      state: AuthState,
      action: PayloadAction<{ token: string; user: User }>,
    ) => {
      state.loading = false;
      state.error = null;
      state.token = action.payload.token;
      state.user = action.payload.user;
      if (typeof window !== "undefined") {
        localStorage.setItem("spendly_token", action.payload.token);
        localStorage.setItem(
          "spendly_user",
          JSON.stringify(action.payload.user),
        );
      }
    };

    builder
      .addCase(loginThunk.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(loginThunk.fulfilled, handleAuth)
      .addCase(loginThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })
      .addCase(registerThunk.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(registerThunk.fulfilled, handleAuth)
      .addCase(registerThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      });
  },
});

export const { initAuth, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
