import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (e) {
        console.error('Failed to load user from storage', e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      if (response.data.status === 'success') {
        const userData = response.data.data;
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        // Assuming the API returns a token or user ID that can be stored
        // For simplicity, we'll store the entire user data object
        await AsyncStorage.setItem('userToken', userData.user_id.toString()); // Store user_id as token
        setUser(userData);
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = async () => {
    if (user?.user_id) {
      try {
        await authApi.logout(user.user_id);
      } catch (error) {
        console.error('Logout API error:', error.response?.data || error.message);
      }
    }
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('userToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
