/**
 * Validation helper functions
 */

export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateMobileNumber = (mobile: string): boolean => {
  if (!mobile) return false;
  // Indian mobile number: 10 digits starting with 6-9
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile);
};

export const isDigitsOnly = (value: string): boolean => {
  return /^\d*$/.test(value);
};

export const formatMobileNumber = (value: string): string => {
  // Remove all non-digit characters
  return value.replace(/\D/g, '');
};

export const validatePincode = (pincode: string): boolean => {
  if (!pincode) return false;
  // Indian pincode: exactly 6 digits
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
};

export const formatPincode = (value: string): string => {
  // Remove all non-digit characters and limit to 6 digits
  return value.replace(/\D/g, '').slice(0, 6);
};
