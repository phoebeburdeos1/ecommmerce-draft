import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

// Auth
export const registerRequest = (payload) =>
  api.post('/auth/register', payload);

export const loginRequest = (payload) => api.post('/auth/login', payload);

export const logoutRequest = () => api.post('/auth/logout');

export const fetchCurrentUser = () => api.get('/auth/user');

// Catalog
export const fetchProducts = () => api.get('/products');

export const fetchProduct = (id) => api.get(`/products/${id}`);

export const fetchCategories = () => api.get('/categories');

// Orders
export const createOrder = (payload) => api.post('/orders', payload);

export const fetchCustomerOrders = () => api.get('/orders');

