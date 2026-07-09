const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiCall<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `API Error: ${response.status}`);
  }

  return data.data !== undefined ? data.data : data;
}

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    apiCall<{
      token: string;
      user: { id: string; name: string; email: string };
    }>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    apiCall<{
      token: string;
      user: { id: string; name: string; email: string };
    }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  getProfile: (token: string) =>
    apiCall<{ id: string; name: string; email: string }>("/auth/profile", {
      token,
    }),

  forgotPassword: (body: { email: string }) =>
    apiCall<{ success: boolean; message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  validateResetToken: (token: string) =>
    apiCall<{ success: boolean; message: string }>(
      `/auth/reset-password/validate?token=${encodeURIComponent(token)}`,
    ),

  resetPassword: (body: { token: string; newPassword: string }) =>
    apiCall<{ success: boolean; message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
}

export const categoriesApi = {
  getAll: (token: string) => apiCall<Category[]>("/categories", { token }),

  create: (
    token: string,
    body: { name: string; icon: string; color: string },
  ) =>
    apiCall<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    }),

  update: (
    token: string,
    id: string,
    body: { name: string; icon: string; color: string },
  ) =>
    apiCall<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
      token,
    }),

  delete: (token: string, id: string) =>
    apiCall<{ message: string }>(`/categories/${id}`, {
      method: "DELETE",
      token,
    }),
};

export interface Expense {
  _id: string;
  userId: string;
  categoryId: Category;
  amount: number;
  description: string;
  date: string;
  paymentMethod: string;
  createdAt: string;
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface PaginatedExpenses {
  data: Expense[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const expensesApi = {
  getAll: async (token: string, filters: ExpenseFilters = {}): Promise<PaginatedExpenses> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(
      ([k, v]) => v !== undefined && params.set(k, String(v)),
    );
    const qs = params.toString();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/expenses${qs ? `?${qs}` : ""}`, { headers });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(json.error || `API Error: ${response.status}`);
    return { data: json.data || [], pagination: json.pagination };
  },

  create: (
    token: string,
    body: {
      categoryId: string;
      amount: number;
      description: string;
      date: string;
      paymentMethod?: string;
    },
  ) =>
    apiCall<Expense>("/expenses", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    }),

  update: (
    token: string,
    id: string,
    body: {
      categoryId: string;
      amount: number;
      description: string;
      date: string;
      paymentMethod?: string;
    },
  ) =>
    apiCall<Expense>(`/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
      token,
    }),

  delete: (token: string, id: string) =>
    apiCall<{ message: string }>(`/expenses/${id}`, {
      method: "DELETE",
      token,
    }),
};

export interface Summary {
  today: { total: number; count: number };
  thisWeek: { total: number; count: number };
  thisMonth: { total: number; count: number };
  allTime: { total: number; count: number };
}

export interface DailyData {
  date: string;
  total: number;
  count: number;
}
export interface CategoryData {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  count: number;
}
export interface MonthlyData {
  label: string;
  total: number;
  count: number;
}
export interface Insight {
  type: "warning" | "success" | "info";
  message: string;
}

export const analyticsApi = {
  getSummary: (token: string) =>
    apiCall<Summary>("/expenses/analytics/summary", { token }),

  getDaily: (
    token: string,
    params?: { startDate?: string; endDate?: string },
  ) => {
    const qs = params ? new URLSearchParams(params as any).toString() : "";
    return apiCall<DailyData[]>(
      `/expenses/analytics/daily${qs ? `?${qs}` : ""}`,
      { token },
    );
  },

  getByCategory: (
    token: string,
    params?: { startDate?: string; endDate?: string },
  ) => {
    const qs = params ? new URLSearchParams(params as any).toString() : "";
    return apiCall<CategoryData[]>(
      `/expenses/analytics/category${qs ? `?${qs}` : ""}`,
      { token },
    );
  },

  getMonthly: (token: string) =>
    apiCall<MonthlyData[]>("/expenses/analytics/monthly", { token }),

  getInsights: (token: string) =>
    apiCall<Insight[]>("/expenses/analytics/insights", { token }),
};
