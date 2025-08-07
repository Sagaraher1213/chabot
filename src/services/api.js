import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.ataichatbot.mcndhanore.co.in/public/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add a request interceptor to include the token if available
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      // Assuming your API uses a Bearer token for authentication
      // Adjust if your API uses a different header (e.g., 'X-API-KEY')
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email, password) => api.post('/verifyUserCredentials', { email, password }),
  logout: (userId) => api.post('/logout', { user_id: userId }),
  // You might need to implement forgotPassword and updatePassword if they are part of the agent flow
};

export const ticketApi = {
  getTicketDetails: (ticketId) => api.get(`/getTicket?id=${ticketId}`),
  updateTicket: (ticketId, complaintIDs, description, updatedBy) => api.post('/updateTicket', {
    ticketId,
    complaintIDs, // This should be an array of objects as per your PHP controller
    description,
    updatedBy,
  }),
  getAllTicketsWithDetails: (clientId) => api.get(`/getAllTicketsWithDetails?clientId=${clientId}`),
  getAgentTicketsWithDetails: (clientId, agentId) => api.get(`/getAgentTicketsWithDetails?client_id=${clientId}&agent_id=${agentId}`),
  getTicketCounts: (agentId = null) => api.get(`/getTicketCounts${agentId ? `?agentId=${agentId}` : ''}`),
  getTicketCountsByClient: (clientId) => api.get(`/getTicketCountsByClient?clientId=${clientId}`),
};

export const userApi = {
  getUserEmail: (userId) => api.get(`/getUserEmail?userId=${userId}`), // Assuming this endpoint exists or is needed
  // Other user-related APIs from UserController.php can be added here
};
