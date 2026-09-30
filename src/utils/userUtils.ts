import TokenManager from './tokenManager';

export const getCurrentUser = () => {
  const tokenManager = TokenManager.getInstance();
  const userId = tokenManager.getUserId();
  
  console.log('[getCurrentUser] TokenManager userId:', userId);
  
  if (!userId) {
    console.log('[getCurrentUser] No userId from TokenManager, checking localStorage...');
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const id = user?.data?.userId || user?.userId;
      console.log('[getCurrentUser] localStorage user data:', { id, fullUser: user });
      
      if (!id) {
        console.log('[getCurrentUser] No user id found anywhere, redirecting to login');
        throw new Error('No user id found');
      }
      return id;
    } catch (error) {
      console.log('[getCurrentUser] Error parsing localStorage or no valid user:', error);
      // Clear any corrupted data
      localStorage.removeItem('user');
      sessionStorage.clear();
      window.location.href = '/login';
      throw new Error('User not authenticated');
    }
  }
  
  console.log('[getCurrentUser] Returning userId:', userId);
  return userId;
};

export const isUserLoggedIn = (): boolean => {
  const tokenManager = TokenManager.getInstance();
  return tokenManager.isLoggedIn();
};

export const logout = (): void => {
  console.log('[logout] Logging out current user');
  const tokenManager = TokenManager.getInstance();
  tokenManager.clearTokens();
  // Clear all cached data
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = '/login';
};

// Example usage for API calls with automatic token management:
/*
import { apiCall } from '../utils/tokenManager';

// GET request
const fetchWallet = async (userId: number) => {
  try {
    const response = await apiCall(`http://65.0.147.157:9900/api/digital-gold/wallet/${userId}`);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message);
  } catch (error) {
    console.error('Wallet fetch failed:', error);
    throw error;
  }
};

// POST request
const previewBuy = async (buyData: any) => {
  try {
    const response = await apiCall('http://65.0.147.157:9900/api/digital-gold/preview-buy', {
      method: 'POST',
      body: JSON.stringify(buyData),
    });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message);
  } catch (error) {
    console.error('Preview buy failed:', error);
    throw error;
  }
};
*/