// Authentication utility functions
export const requireAuth = () => {
  const userData = localStorage.getItem('user');
  if (!userData) {
    window.location.href = '/login';
    return false;
  }
  
  try {
    const user = JSON.parse(userData);
    if (!user.data || !user.data.accessToken) {
      window.location.href = '/login';
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('user');
    window.location.href = '/login';
    return false;
  }
};

export const getCurrentUser = () => {
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    const user = JSON.parse(userData);
    return user.data || null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const isUserLoggedIn = () => {
  const userData = localStorage.getItem('user');
  if (!userData) return false;
  
  try {
    const user = JSON.parse(userData);
    return !!(user.data && user.data.accessToken);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getAuthToken = () => {
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    const user = JSON.parse(userData);
    return user.data?.accessToken || null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const getUserId = () => {
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    const user = JSON.parse(userData);
    return user.data?.userId || null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};