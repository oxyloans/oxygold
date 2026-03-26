import TokenManager from './tokenManager';

export const debugTokens = () => {
  console.log('=== TOKEN DEBUG ===');
  
  const tokenManager = TokenManager.getInstance();
  
  console.log('TokenManager state:');
  console.log('- Access token exists:', !!tokenManager.getAccessToken());
  console.log('- User ID:', tokenManager.getUserId());
  console.log('- Is logged in:', tokenManager.isLoggedIn());
  
  // Check localStorage directly
  const userData = localStorage.getItem('user');
  console.log('\\nLocalStorage user data:', userData);
  
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      console.log('Parsed data:', parsed);
    } catch (error) {
      console.error('Error parsing localStorage data:', error);
    }
  }
  
  console.log('=== END TOKEN DEBUG ===');
};

export const testTokenRefresh = async () => {
  console.log('=== TESTING TOKEN REFRESH ===');
  
  const tokenManager = TokenManager.getInstance();
  
  try {
    const newToken = await tokenManager.refreshAccessToken();
    console.log('Token refresh successful:', newToken ? newToken.substring(0, 20) + '...' : 'null');
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
  
  console.log('=== END TOKEN REFRESH TEST ===');
};