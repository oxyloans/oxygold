// Payment flow debugging utilities

export const debugPaymentData = (data: any, context: string) => {
  console.log(`=== PAYMENT DEBUG: ${context} ===`);
  console.log('Payment data:', data);
  console.log('Data type:', typeof data);
  console.log('Is array:', Array.isArray(data));
  console.log('Keys:', data ? Object.keys(data) : 'No data');
  console.log('=== END PAYMENT DEBUG ===');
};

export const validatePaymentSession = (sessionData: any) => {
  const required = ['paymentSessionId', 'transactionId'];
  const missing = required.filter(field => !sessionData?.[field]);
  
  if (missing.length > 0) {
    console.error('Missing required payment fields:', missing);
    return false;
  }
  
  console.log('Payment session validation passed');
  return true;
};

export const debugCashfreeInit = (config: any) => {
  console.log('=== CASHFREE INIT DEBUG ===');
  console.log('Config:', config);
  console.log('Environment:', config?.environment);
  console.log('Session ID:', config?.paymentSessionId);
  console.log('=== END CASHFREE DEBUG ===');
};

export const debugAPIResponse = (response: any, endpoint: string) => {
  console.log(`=== API RESPONSE DEBUG: ${endpoint} ===`);
  console.log('Status:', response?.status);
  console.log('Success:', response?.success);
  console.log('Data:', response?.data);
  console.log('Message:', response?.message);
  console.log('=== END API RESPONSE DEBUG ===');
};