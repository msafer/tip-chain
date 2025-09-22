// User and Profile Types
export interface User {
  id: string;
  address: string;
  ens?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  user: User;
  totalSent: string;
  totalReceived: string;
  tipsSent: number;
  tipsReceived: number;
  rank: number;
  badges: string[];
}

// Tip and Transaction Types
export interface Tip {
  id: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  chainId: number;
  txHash: string;
  blockNumber: number;
  timestamp: Date;
  message?: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface TipRequest {
  amount: string;
  token: string;
  recipient: string;
  chainId?: number;
  message?: string;
}

// Token and Currency Types
export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  address?: string;
  chainId: number;
  icon: string;
  isNative: boolean;
}

export interface TokenBalance {
  token: Token;
  balance: string;
  formatted: string;
  usdValue?: number;
}

// Chain Types
export interface SupportedChain {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  iconUrl?: string;
}

// Farcaster Frame Types
export interface FrameMessage {
  fid: number;
  url: string;
  messageHash: string;
  timestamp: number;
  network: number;
  buttonIndex: number;
  inputText?: string;
  castId?: {
    fid: number;
    hash: string;
  };
}

export interface FrameButton {
  content: string;
  action: 'post' | 'link' | 'tx';
  target?: string;
  postUrl?: string;
}

export interface FrameConfig {
  image: string;
  imageAspectRatio?: '1.91:1' | '1:1';
  buttons?: FrameButton[];
  inputText?: string;
  textInput?: string;
  state?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number;
  user: User;
  amount: string;
  count: number;
  percentage?: number;
}

export interface LeaderboardData {
  period: 'day' | 'week' | 'month' | 'year' | 'all';
  tippers: LeaderboardEntry[];
  recipients: LeaderboardEntry[];
  lastUpdated: Date;
}

// Analytics Types
export interface TipAnalytics {
  totalTips: number;
  totalVolume: string;
  totalUsers: number;
  dailyVolume: Array<{
    date: string;
    volume: string;
    count: number;
  }>;
  topTokens: Array<{
    token: string;
    volume: string;
    count: number;
    percentage: number;
  }>;
  chainDistribution: Array<{
    chainId: number;
    chainName: string;
    volume: string;
    count: number;
    percentage: number;
  }>;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  field?: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// Rate Limiting Types
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Contract Types
export interface ContractInfo {
  address: string;
  abi: any[];
  chainId: number;
}

export interface TokenContract extends ContractInfo {
  symbol: string;
  decimals: number;
}

// Event Types
export interface TipEvent {
  type: 'tip_sent' | 'tip_received' | 'tip_failed';
  tip: Tip;
  user: User;
  timestamp: Date;
}

// UI Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  token?: string;
  chainId?: number;
  minAmount?: string;
  maxAmount?: string;
  startDate?: Date;
  endDate?: Date;
  status?: Tip['status'];
}

export interface SortOptions {
  field: 'timestamp' | 'amount' | 'rank';
  direction: 'asc' | 'desc';
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

// Theme Types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  secondaryColor: string;
  borderRadius: number;
}

// Environment Types
export interface AppConfig {
  appUrl: string;
  apiUrl: string;
  chainIds: number[];
  defaultChainId: number;
  farcasterHubUrl: string;
  farcasterAppFid: string;
  rateLimits: {
    tips: number;
    frames: number;
  };
  features: {
    analytics: boolean;
    leaderboards: boolean;
    notifications: boolean;
  };
}
