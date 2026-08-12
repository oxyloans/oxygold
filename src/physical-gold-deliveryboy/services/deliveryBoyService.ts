import { API_BASE_URL } from '../../Config';

const BASE_URL = `${API_BASE_URL}/oxygold-api`;
const SESSION_KEY = 'deliveryBoy';
export const DELIVERY_BOY_ID_KEY = 'DeliveryBoy-Id';

export interface DeliveryBoySession {
  email: string;
  isLoggedIn: true;
  token: string;
  accessToken: string;
  refreshToken: string;
  role: string;
  deliveryBoyId: number;
  [key: string]: any;
}

export interface DeliveryAssignment {
  id: number;
  trackingNumber: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  customerLatitude: number | null;
  customerLongitude: number | null;
  notes?: string | null;
  assignedAt?: string | null;
}

export type DeliveryStatus =
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'REASSIGNED';

export interface DeliverySummary {
  deliveryBoyId: number;
  deliveryBoyName: string;
  assigned: number;
  accepted: number;
  rejected: number;
  pickedUp: number;
  outForDelivery: number;
  delivered: number;
  failed: number;
  activeDeliveries: number;
}

export interface DeliveryOrder {
  deliveryId: number;
  trackingNumber: string;
  status: DeliveryStatus;
  statusLabel: string;
  orderId: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  assignedAt?: string | null;
  acceptedAt?: string | null;
  pickedUpAt?: string | null;
  outForDeliveryAt?: string | null;
  deliveredAt?: string | null;
}

export interface DeliveryOrdersPage {
  content: DeliveryOrder[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  [key: string]: any;
}

const firstValue = (result: any, key: string) =>
  result?.[key] ?? result?.data?.[key] ?? result?.result?.[key];

export const deliveryBoyLogin = async (email: string, password: string) => {
  const response = await fetch(`${BASE_URL}/auth/adminLogin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: '*/*' },
    body: JSON.stringify({ email, password }),
  });
  const result = await response.json();
  if (!response.ok || result.success === false) {
    throw new Error(result.message || result.error || 'Unable to sign in');
  }
  return result;
};

export const saveDeliveryBoySession = (email: string, result: any) => {
  const token = String(
    firstValue(result, 'token') ?? firstValue(result, 'accessToken') ?? '',
  );
  const role = String(firstValue(result, 'role') || 'DELIVERY_BOY').toUpperCase();
  const refreshToken = String(firstValue(result, 'refreshToken') ?? '');
  const deliveryBoyId = Number(firstValue(result, 'deliveryBoyId'));

  if (!Number.isInteger(deliveryBoyId) || deliveryBoyId <= 0) {
    throw new Error('Delivery partner ID was not returned by the login service.');
  }

  const session: DeliveryBoySession = {
    ...result,
    email,
    isLoggedIn: true,
    token,
    accessToken: token,
    refreshToken,
    role,
    deliveryBoyId,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(DELIVERY_BOY_ID_KEY, String(deliveryBoyId));
  return session;
};

export const getDeliveryBoySession = (): DeliveryBoySession | null => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const getDeliveryBoyId = () => {
  const storedId = Number(localStorage.getItem(DELIVERY_BOY_ID_KEY));
  if (Number.isInteger(storedId) && storedId > 0) return storedId;
  const sessionId = Number(getDeliveryBoySession()?.deliveryBoyId);
  return Number.isInteger(sessionId) && sessionId > 0 ? sessionId : null;
};

export const isDeliveryBoyLoggedIn = () => {
  const session = getDeliveryBoySession();
  return Boolean(session?.isLoggedIn && session?.token && getDeliveryBoyId());
};

export const deliveryBoyLogout = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(DELIVERY_BOY_ID_KEY);
};

const updateDeliveryBoyTokens = (accessToken: string, refreshToken?: string) => {
  const session = getDeliveryBoySession();
  if (!session) throw new Error('Delivery session was not found.');
  const nextRefreshToken = refreshToken || session.refreshToken || String(firstValue(session, 'refreshToken') || '');
  const updatedSession: DeliveryBoySession = {
    ...session,
    token: accessToken,
    accessToken,
    refreshToken: nextRefreshToken,
  };
  if (updatedSession.data && typeof updatedSession.data === 'object') {
    updatedSession.data = { ...updatedSession.data, accessToken, refreshToken: nextRefreshToken };
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
};

let refreshPromise: Promise<string> | null = null;

export const refreshDeliveryBoyAccessToken = async (): Promise<string> => {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const session = getDeliveryBoySession();
    const refreshToken = String(session?.refreshToken || firstValue(session, 'refreshToken') || '');
    if (!refreshToken) throw new Error('Your session has expired. Please sign in again.');

    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: '*/*' },
      body: JSON.stringify({ refreshToken }),
    });
    const result = await response.json().catch(() => ({}));
    const accessToken = String(firstValue(result, 'accessToken') ?? firstValue(result, 'token') ?? '');
    if (!response.ok || result.success === false || !accessToken) {
      throw new Error(result.message || result.error || 'Your session has expired. Please sign in again.');
    }
    updateDeliveryBoyTokens(accessToken, String(firstValue(result, 'refreshToken') || refreshToken));
    return accessToken;
  })();

  try {
    return await refreshPromise;
  } catch (error) {
    deliveryBoyLogout();
    window.dispatchEvent(new Event('delivery-session-expired'));
    throw error;
  } finally {
    refreshPromise = null;
  }
};

const authenticatedDeliveryFetch = async (url: string, options: RequestInit, deliveryBoyId: number) => {
  const headers = new Headers(options.headers);
  headers.set('Accept', '*/*');
  headers.set('Authorization', `Bearer ${getDeliveryBoySession()?.token || ''}`);
  headers.set('X-DeliveryBoy-Id', String(deliveryBoyId));
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    const accessToken = await refreshDeliveryBoyAccessToken();
    headers.set('Authorization', `Bearer ${accessToken}`);
    response = await fetch(url, { ...options, headers });
  }
  return response;
};

const deliveryRequest = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> => {
  const session = getDeliveryBoySession();
  const deliveryBoyId = getDeliveryBoyId();
  if (!session?.token || !deliveryBoyId) {
    throw new Error('Your delivery session is invalid. Please sign in again.');
  }

  const response = await authenticatedDeliveryFetch(`${BASE_URL}${path}`, options, deliveryBoyId);
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === false) {
    throw new Error(result.message || result.error || 'Delivery request failed');
  }
  return result;
};

const postDeliveryAction = <T>(path: string, body: Record<string, unknown>) =>
  deliveryRequest<T>(path, { method: 'POST', body: JSON.stringify(body) });

export const fetchAssignedDeliveries = () =>
  deliveryRequest<DeliveryAssignment[]>('/delivery/assigned');
export const fetchActiveDeliveries = () =>
  deliveryRequest<DeliveryAssignment[]>('/delivery/active');
export const fetchDeliverySummary = () => {
  const deliveryBoyId = getDeliveryBoyId();
  if (!deliveryBoyId) return Promise.reject(new Error('Delivery partner ID is missing. Please sign in again.'));
  return deliveryRequest<DeliverySummary>(`/delivery/boy/${deliveryBoyId}/summary`);
};
export const fetchDeliveryOrders = (status: DeliveryStatus, page = 0, size = 10) => {
  const deliveryBoyId = getDeliveryBoyId();
  if (!deliveryBoyId) return Promise.reject(new Error('Delivery partner ID is missing. Please sign in again.'));
  const query = new URLSearchParams({ status, page: String(page), size: String(size) });
  return deliveryRequest<DeliveryOrdersPage>(`/delivery/boy/${deliveryBoyId}/orders?${query}`);
};
export const fetchCurrentDeliveries = async (): Promise<DeliveryAssignment[]> => {
  const activeStatuses: DeliveryStatus[] = ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY'];
  const results = await Promise.allSettled(activeStatuses.map(status => fetchDeliveryOrders(status, 0, 50)));
  const successful = results.filter((result): result is PromiseFulfilledResult<ApiResponse<DeliveryOrdersPage>> => result.status === 'fulfilled');
  if (!successful.length) {
    const failed = results.find((result): result is PromiseRejectedResult => result.status === 'rejected');
    throw failed?.reason || new Error('Unable to load current deliveries.');
  }
  const byId = new Map<number, DeliveryAssignment>();
  successful.flatMap(result => result.value.data?.content || []).forEach(order => {
    byId.set(order.deliveryId, {
      id: order.deliveryId,
      trackingNumber: order.trackingNumber,
      orderNumber: order.orderNumber,
      status: order.status,
      statusLabel: order.statusLabel,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deliveryAddress: order.deliveryAddress,
      customerLatitude: null,
      customerLongitude: null,
      assignedAt: order.assignedAt,
    });
  });
  return Array.from(byId.values()).sort((a, b) => {
    const statusDifference = activeStatuses.indexOf(a.status as DeliveryStatus) - activeStatuses.indexOf(b.status as DeliveryStatus);
    if (statusDifference !== 0) return statusDifference;
    return new Date(b.assignedAt || 0).getTime() - new Date(a.assignedAt || 0).getTime();
  });
};
export const acceptDelivery = (deliveryId: number) =>
  postDeliveryAction('/delivery/accept', { deliveryId });
export const pickupDelivery = (deliveryId: number) =>
  postDeliveryAction('/delivery/pickup', { deliveryId });
export const updateDeliveryLocation = (
  deliveryId: number,
  latitude: number,
  longitude: number,
) => postDeliveryAction('/delivery/location', { deliveryId, latitude, longitude });
export const markOutForDelivery = (deliveryId: number) =>
  postDeliveryAction('/delivery/out-for-delivery', { deliveryId });
export const deliverOrder = (deliveryId: number) =>
  postDeliveryAction('/delivery/deliver', { deliveryId });
export const rejectDelivery = (deliveryId: number, reason: string) =>
  postDeliveryAction('/delivery/reject', { deliveryId, reason });
export const markDeliveryFailed = (deliveryId: number, failureReason: string) =>
  postDeliveryAction('/delivery/failed', { deliveryId, failureReason });
