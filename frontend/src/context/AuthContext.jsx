import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const initialState = {
  user: JSON.parse(localStorage.getItem('study_planner_user')) || null,
  token: localStorage.getItem('study_planner_token') || null,
  isAuthenticated: !!localStorage.getItem('study_planner_token'),
  loading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'AUTH_ERROR':
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload || null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const loadUser = async () => {
      if (state.token) {
        try {
          const data = await authService.getMe();
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: data.data, token: state.token },
          });
          localStorage.setItem('study_planner_user', JSON.stringify(data.data));
        } catch (err) {
          dispatch({ type: 'AUTH_ERROR', payload: err.response?.data?.message });
          localStorage.removeItem('study_planner_token');
          localStorage.removeItem('study_planner_user');
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadUser();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await authService.login(credentials);
      const { token, ...userData } = data.data;
      localStorage.setItem('study_planner_token', token);
      localStorage.setItem('study_planner_user', JSON.stringify(userData));
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: userData, token },
      });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: msg });
      return { success: false, message: msg };
    }
  };

  const register = async (userDataInput) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await authService.register(userDataInput);
      const { token, ...userData } = data.data;
      localStorage.setItem('study_planner_token', token);
      localStorage.setItem('study_planner_user', JSON.stringify(userData));
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: userData, token },
      });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: msg });
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('study_planner_token');
    localStorage.removeItem('study_planner_user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (updatedData) => {
    try {
      const res = await authService.updateProfile(updatedData);
      dispatch({ type: 'UPDATE_USER', payload: res.data });
      localStorage.setItem('study_planner_user', JSON.stringify(res.data));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Update failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
