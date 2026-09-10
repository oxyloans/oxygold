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
  // Indian pincode: exactly 6 digits, must not be all same digit (e.g. 000000, 111111)
  if (!/^\d{6}$/.test(pincode)) return false;
  if (/^(\d)\1{5}$/.test(pincode)) return false; // all same digit
  if (pincode.startsWith('0')) return false; // Indian pincodes never start with 0
  return true;
};

export const getPincodeError = (pincode: string): string => {
  if (!pincode.trim()) return 'Pin code is required';
  if (pincode.length < 6) return 'Pin code must be exactly 6 digits';
  if (!/^\d{6}$/.test(pincode)) return 'Pin code must contain only digits';
  if (pincode.startsWith('0')) return 'Invalid pin code';
  if (/^(\d)\1{5}$/.test(pincode)) return 'Invalid pin code';
  return '';
};

export const formatPincode = (value: string): string => {
  // Remove all non-digit characters and limit to 6 digits
  return value.replace(/\D/g, '').slice(0, 6);
};
