interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  userId: number;
  tokenType: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}

class TokenManager {
  private static instance: TokenManager;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: Date | null = null;
  private userId: number | null = null;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<string> | null = null;

  private constructor() {
    this.loadTokensFromStorage();
  }

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    // Always reload from storage to ensure we have the latest user data
    TokenManager.instance.loadTokensFromStorage();
    return TokenManager.instance;
  }

  public loadTokensFromStorage(): void {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      const user = JSON.parse(userData);
      if (!user.data) return;

      this.accessToken = user.data.accessToken;
      this.refreshToken = user.data.refreshToken;
      this.userId = user.data.userId;

      const exp = user.data.expiresIn;
      if (exp) {
        const asNumber = Number(exp);
        if (!isNaN(asNumber) && asNumber > 1_000_000_000) {
          // already a unix timestamp in ms (shouldn't happen, but safe)
          this.expiresAt = new Date(asNumber);
        } else if (!isNaN(asNumber) && asNumber > 0 && asNumber < 1_000_000) {
          // raw seconds like 3600 — treat as seconds from now (legacy entry)
          this.expiresAt = new Date(Date.now() + asNumber * 1000);
        } else {
          // ISO string (the normal case after setTokens stores it)
          const d = new Date(exp);
          this.expiresAt = isNaN(d.getTime()) ? null : d;
        }
      }

      console.log('[TokenManager] Loaded from storage:', {
        userId: this.userId,
        hasAccessToken: !!this.accessToken,
        hasRefreshToken: !!this.refreshToken,
        expiresAt: this.expiresAt?.toISOString(),
        isExpired: this.expiresAt ? new Date() > this.expiresAt : false,
      });
    } catch (error) {
      console.error('[TokenManager] Error loading tokens:', error);
      this.clearTokens();
    }
  }

  public setTokens(tokenData: TokenData): void {
    console.log('[TokenManager] Setting new tokens for user:', tokenData.userId);
    
    // Clear any existing tokens first to prevent data mixing
    this.clearTokens();
    
    this.accessToken = tokenData.accessToken;
    this.refreshToken = tokenData.refreshToken;
    this.userId = tokenData.userId;

    // expiresIn can be seconds (e.g. 3600) or an ISO date string
    const exp = tokenData.expiresIn;
    const asNumber = Number(exp);
    if (!isNaN(asNumber) && asNumber > 0) {
      // treat as seconds from now
      this.expiresAt = new Date(Date.now() + asNumber * 1000);
    } else {
      // treat as ISO date string
      const d = new Date(exp);
      this.expiresAt = isNaN(d.getTime()) ? null : d;
    }

    const userData = {
      data: {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresIn: this.expiresAt ? this.expiresAt.toISOString() : tokenData.expiresIn,
        userId: tokenData.userId,
        tokenType: tokenData.tokenType,
      }
    };
    localStorage.setItem('user', JSON.stringify(userData));
    
    console.log('[TokenManager] New user tokens stored:', {
      userId: this.userId,
      hasAccessToken: !!this.accessToken,
      expiresAt: this.expiresAt?.toISOString()
    });
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public getUserId(): number | null {
    return this.userId;
  }

  private isTokenExpired(): boolean {
    if (!this.expiresAt) return false; // no expiry info — assume valid
    const bufferMs = 60 * 1000; // refresh 1 min before expiry
    const expired = new Date().getTime() > (this.expiresAt.getTime() - bufferMs);
    if (expired) {
      console.log('[TokenManager] Access token expired at', this.expiresAt.toISOString(), '— will refresh');
    }
    return expired;
  }

  public async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newAccessToken = await this.refreshPromise;
      return newAccessToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    try {
      console.log('[TokenManager] Refreshing access token...');
      const response = await fetch('https://meta.oxyloans.com/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data: ApiResponse<TokenData> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Token refresh failed');
      }

      // Refresh response may return tokens at root level or under data
      const tokenPayload: TokenData = data.data ?? (data as any);
      if (!tokenPayload.accessToken) {
        throw new Error('Refresh response missing accessToken');
      }

      // Preserve existing userId/refreshToken if not returned by refresh endpoint
      this.setTokens({
        accessToken: tokenPayload.accessToken,
        refreshToken: tokenPayload.refreshToken || this.refreshToken!,
        expiresIn: tokenPayload.expiresIn || '3600',
        userId: tokenPayload.userId || this.userId!,
        tokenType: tokenPayload.tokenType || 'Bearer',
      });

      console.log('[TokenManager] Token refreshed. New expiry:', this.expiresAt?.toISOString());
      return tokenPayload.accessToken;
    } catch (error) {
      console.error('[TokenManager] Token refresh failed:', error);
      this.clearTokens();
      window.location.href = '/login';
      throw error;
    }
  }

  public async getValidAccessToken(): Promise<string> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    if (this.isTokenExpired()) {
      console.log('Access token expired, refreshing...');
      return await this.refreshAccessToken();
    }

    return this.accessToken;
  }

  public clearTokens(): void {
    console.log('[TokenManager] Clearing tokens for user:', this.userId);
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;
    this.userId = null;
    localStorage.removeItem('user');
    sessionStorage.removeItem('paymentSuccessData');
    // Clear any cached data that might be user-specific
    sessionStorage.clear();
  }

  public isLoggedIn(): boolean {
    return !!(this.accessToken && this.refreshToken);
  }
}

// API wrapper function that automatically handles token refresh
export const apiCall = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const tokenManager = TokenManager.getInstance();

  if (!tokenManager.isLoggedIn()) {
    console.error('[apiCall] User not logged in, redirecting to login');
    window.location.href = '/login';
    throw new Error('User not logged in');
  }

  try {
    const accessToken = await tokenManager.getValidAccessToken();

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    console.log(`[apiCall] ${options.method || 'GET'} ${url} → ${response.status}`);
    const data: ApiResponse<T> = await response.json();

    if (response.status === 401) {
      console.log('[apiCall] 401 received, retrying after token refresh...');
      try {
        const newAccessToken = await tokenManager.refreshAccessToken();
        const retryResponse = await fetch(url, {
          ...options,
          headers: { ...headers, 'Authorization': `Bearer ${newAccessToken}` },
        });
        console.log(`[apiCall] Retry → ${retryResponse.status}`);
        return await retryResponse.json();
      } catch (refreshError) {
        console.error('[apiCall] Retry after refresh failed:', refreshError);
        tokenManager.clearTokens();
        window.location.href = '/login';
        throw refreshError;
      }
    }

    return data;
  } catch (error) {
    console.error('[apiCall] Failed:', error);
    throw error;
  }
};

export default TokenManager;