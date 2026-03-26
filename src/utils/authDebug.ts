// Debug utility to check authentication state
export const debugAuth = () => {
  console.log('=== AUTH DEBUG ===');
  
  const userData = localStorage.getItem('user');
  console.log('Raw user data from localStorage:', userData);
  
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      console.log('Parsed user data:', parsed);
      console.log('Has data property:', !!parsed.data);
      console.log('Access token exists:', !!(parsed.data?.accessToken));
      console.log('Refresh token exists:', !!(parsed.data?.refreshToken));
      console.log('User ID:', parsed.data?.userId);
      console.log('Expires at:', parsed.data?.expiresIn);
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  } else {
    console.log('No user data found in localStorage');
  }
  
  console.log('=== END AUTH DEBUG ===');
};

export const checkTokenExpiry = () => {
  const userData = localStorage.getItem('user');
  if (!userData) return { expired: true, reason: 'No user data' };
  
  try {
    const parsed = JSON.parse(userData);
    const expiresIn = parsed.data?.expiresIn;
    
    if (!expiresIn) return { expired: true, reason: 'No expiry time' };
    
    const expiryDate = new Date(expiresIn);
    const now = new Date();
    const isExpired = now > expiryDate;
    
    return {
      expired: isExpired,
      expiryDate: expiryDate.toISOString(),
      currentTime: now.toISOString(),
      timeUntilExpiry: isExpired ? 'Already expired' : `${Math.floor((expiryDate.getTime() - now.getTime()) / 1000 / 60)} minutes`
    };
  } catch (error) {
    return { expired: true, reason: 'Parse error', error: error.message };
  }
};