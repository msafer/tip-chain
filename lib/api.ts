import type { 
  ApiResponse, 
  PaginatedResponse, 
  Tip, 
  TipRequest, 
  LeaderboardData,
  TipAnalytics,
  UserProfile,
  SearchFilters,
  SortOptions 
} from './types';

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const DEFAULT_TIMEOUT = 10000; // 10 seconds

// API client class
export class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = API_BASE_URL, timeout: number = DEFAULT_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  // Generic request method
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: 'Unknown error occurred',
      };
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
    }

    return this.request<T>(url, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Default API client instance
export const apiClient = new ApiClient();

// Tips API
export const tipsApi = {
  // Create a new tip
  create: async (tip: TipRequest): Promise<ApiResponse<Tip>> => {
    return apiClient.post<Tip>('/tips', tip);
  },

  // Get tips with filters and pagination
  list: async (
    filters?: SearchFilters,
    sort?: SortOptions,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Tip>> => {
    const params = {
      ...filters,
      sortField: sort?.field,
      sortDirection: sort?.direction,
      page,
      limit,
    };

    return apiClient.get<Tip[]>('/tips', params) as Promise<PaginatedResponse<Tip>>;
  },

  // Get tip by ID
  getById: async (id: string): Promise<ApiResponse<Tip>> => {
    return apiClient.get<Tip>(`/tips/${id}`);
  },

  // Get tips by user address
  getByUser: async (
    address: string,
    type: 'sent' | 'received' = 'sent',
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Tip>> => {
    const params = { type, page, limit };
    return apiClient.get<Tip[]>(`/tips/user/${address}`, params) as Promise<PaginatedResponse<Tip>>;
  },

  // Get tip by transaction hash
  getByTxHash: async (txHash: string): Promise<ApiResponse<Tip>> => {
    return apiClient.get<Tip>(`/tips/tx/${txHash}`);
  },
};

// Analytics API
export const analyticsApi = {
  // Get overall analytics
  getOverview: async (period: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<ApiResponse<TipAnalytics>> => {
    return apiClient.get<TipAnalytics>('/analytics/overview', { period });
  },

  // Get user analytics
  getUserAnalytics: async (address: string): Promise<ApiResponse<UserProfile>> => {
    return apiClient.get<UserProfile>(`/analytics/user/${address}`);
  },

  // Get token analytics
  getTokenAnalytics: async (symbol: string): Promise<ApiResponse<any>> => {
    return apiClient.get(`/analytics/token/${symbol}`);
  },

  // Get chain analytics
  getChainAnalytics: async (chainId: number): Promise<ApiResponse<any>> => {
    return apiClient.get(`/analytics/chain/${chainId}`);
  },
};

// Leaderboards API
export const leaderboardsApi = {
  // Get leaderboards
  get: async (period: 'day' | 'week' | 'month' | 'year' | 'all' = 'week'): Promise<ApiResponse<LeaderboardData>> => {
    return apiClient.get<LeaderboardData>('/leaderboards', { period });
  },

  // Get user rank
  getUserRank: async (address: string, type: 'tips' | 'volume' = 'volume'): Promise<ApiResponse<{ rank: number }>> => {
    return apiClient.get<{ rank: number }>(`/leaderboards/rank/${address}`, { type });
  },
};

// Users API
export const usersApi = {
  // Get user profile
  getProfile: async (address: string): Promise<ApiResponse<UserProfile>> => {
    return apiClient.get<UserProfile>(`/users/${address}`);
  },

  // Update user profile
  updateProfile: async (address: string, updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> => {
    return apiClient.put<UserProfile>(`/users/${address}`, updates);
  },

  // Search users
  search: async (query: string, limit: number = 10): Promise<ApiResponse<UserProfile[]>> => {
    return apiClient.get<UserProfile[]>('/users/search', { query, limit });
  },
};

// Frames API
export const framesApi = {
  // Validate frame message
  validateMessage: async (message: any): Promise<ApiResponse<{ valid: boolean }>> => {
    return apiClient.post<{ valid: boolean }>('/frames/validate', message);
  },

  // Get frame metadata
  getMetadata: async (url: string): Promise<ApiResponse<any>> => {
    return apiClient.get('/frames/metadata', { url });
  },
};

// Health check API
export const healthApi = {
  // Check API health
  check: async (): Promise<ApiResponse<{ status: string; timestamp: string }>> => {
    return apiClient.get('/health');
  },

  // Get system status
  getStatus: async (): Promise<ApiResponse<any>> => {
    return apiClient.get('/health/status');
  },
};

// Error handling utilities
export function isApiError(response: ApiResponse<any>): boolean {
  return !response.success;
}

export function getErrorMessage(response: ApiResponse<any>): string {
  return response.error || 'An unexpected error occurred';
}

// Retry logic for failed requests
export async function withRetry<T>(
  operation: () => Promise<ApiResponse<T>>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<ApiResponse<T>> {
  let lastError: ApiResponse<T> | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      
      if (result.success) {
        return result;
      }
      
      lastError = result;
      
      // Don't retry on client errors (4xx)
      if (result.error?.includes('4')) {
        break;
      }
    } catch (error) {
      lastError = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Wait before retrying (exponential backoff)
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }

  return lastError || {
    success: false,
    error: 'All retry attempts failed',
  };
}

// Cache for GET requests
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export async function cachedGet<T>(
  endpoint: string,
  params?: Record<string, any>,
  ttl: number = 60000 // 1 minute default
): Promise<ApiResponse<T>> {
  const cacheKey = `${endpoint}?${new URLSearchParams(params || {}).toString()}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return { success: true, data: cached.data };
  }

  const response = await apiClient.get<T>(endpoint, params);

  if (response.success) {
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now(),
      ttl,
    });
  }

  return response;
}

// Clear cache
export function clearCache(pattern?: string): void {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
}

// Export the API client and all API modules
export default {
  client: apiClient,
  tips: tipsApi,
  analytics: analyticsApi,
  leaderboards: leaderboardsApi,
  users: usersApi,
  frames: framesApi,
  health: healthApi,
};
