/**
 * API Service Layer
 * Centralized HTTP client using Axios
 */

import axios from 'axios';
import { STORAGE_KEYS, ERROR_MESSAGES } from '@/utils/constants';

// Create Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
        : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // Return data directly
    return response.data;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER_DATA);
            window.location.href = '/login';
          }
          break;
        case 403:
          error.message = ERROR_MESSAGES.FORBIDDEN;
          break;
        case 404:
          error.message = ERROR_MESSAGES.NOT_FOUND;
          break;
        case 500:
          error.message = ERROR_MESSAGES.SERVER_ERROR;
          break;
        default:
          error.message = data?.message || error.message;
      }
    } else if (error.request) {
      // Request made but no response
      error.message = ERROR_MESSAGES.NETWORK_ERROR;
    }

    return Promise.reject(error);
  },
);

// ============================================
// Authentication API
// ============================================

export const authAPI = {
  /**
   * Login user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{token: string, user: Object}>}
   */
  login: (email, password) => api.post('/api/auth/login', { email, password }),

  /**
   * Register new user
   * @param {Object} userData - {email, password, name, role, walletAddress?}
   * @returns {Promise<{token: string, user: Object}>}
   */
  register: (userData) => api.post('/api/auth/register', userData),

  /**
   * Get current user profile
   * @returns {Promise<{user: Object}>}
   */
  me: () => api.get('/api/auth/me'),

  /**
   * Logout (client-side only)
   */
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  },
};

// ============================================
// Products API
// ============================================

export const productsAPI = {
  /**
   * Create new product
   * @param {Object} productData - {name, batchNumber, manufacturerDate?}
   * @returns {Promise<{product: Object}>}
   */
  create: (productData) => api.post('/api/products', productData),

  /**
   * Get all products with optional filters
   * @param {Object} filters - {status?, search?, page?, limit?}
   * @returns {Promise<{products: Array, total: number}>}
   */
  getAll: (filters = {}) => api.get('/api/products', { params: filters }),

  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @returns {Promise<{product: Object}>}
   */
  getById: (id) => api.get(`/api/products/${id}`),

  /**
   * Verify product by QR code
   * @param {string} qrCode - QR code (format: NEXUS-{id})
   * @returns {Promise<{product: Object, isAuthentic: boolean}>}
   */
  verify: (qrCode) => api.get(`/api/products/verify/${qrCode}`),

  /**
   * Get product by blockchain ID
   * @param {number} blockchainId - Blockchain product ID
   * @returns {Promise<{product: Object}>}
   */
  getByBlockchainId: (blockchainId) =>
    api.get(`/api/products/blockchain/${blockchainId}`),
};

// ============================================
// Checkpoints API
// ============================================

export const checkpointsAPI = {
  /**
   * Create new checkpoint
   * @param {Object} checkpointData - {productId, location, latitude?, longitude?, status, temperature, notes?}
   * @returns {Promise<{checkpoint: Object}>}
   */
  create: (checkpointData) => api.post('/api/checkpoints', checkpointData),

  /**
   * Get checkpoints for a product
   * @param {string} productId - Product ID
   * @returns {Promise<{checkpoints: Array}>}
   */
  getByProduct: (productId) => api.get(`/api/checkpoints/product/${productId}`),

  /**
   * Update checkpoint
   * @param {string} checkpointId - Checkpoint ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<{checkpoint: Object}>}
   */
  update: (checkpointId, updateData) =>
    api.patch(`/api/checkpoints/${checkpointId}`, updateData),
};

// ============================================
// User API
// ============================================

export const userAPI = {
  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<{user: Object}>}
   */
  getProfile: (userId) => api.get(`/api/users/${userId}`),

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<{user: Object}>}
   */
  updateProfile: (userId, updateData) =>
    api.patch(`/api/users/${userId}`, updateData),

  /**
   * Update wallet address
   * @param {string} walletAddress - Ethereum wallet address
   * @returns {Promise<{user: Object}>}
   */
  updateWallet: (walletAddress) =>
    api.patch('/api/users/wallet', { walletAddress }),
};

export default api;
