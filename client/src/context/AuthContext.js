import React, { createContext, useReducer } from 'react';
import axios from 'axios';

// API base URL
const API_BASE_URL = 'http://localhost:5000';

// Initial state
const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
    error: null
};

// Create context
export const AuthContext = createContext(initialState);

// Reducer function
const authReducer = (state, action) => {
    switch (action.type) {
        case 'USER_LOADED':
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: action.payload
            };
        case 'REGISTER_SUCCESS':
        case 'LOGIN_SUCCESS':
            if (action.payload.token) {
                console.log('Saving token to localStorage:', action.payload.token.substring(0, 20) + '...');
                localStorage.setItem('token', action.payload.token);
            } else {
                console.error('Token missing in payload:', action.payload);
            }
            return {
                ...state,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false
            };
        case 'AUTH_ERROR':
        case 'REGISTER_FAIL':
        case 'LOGIN_FAIL':
        case 'LOGOUT':
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null,
                error: action.payload
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
};

// Provider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Load User
    const loadUser = async () => {
        try {
            console.log('Attempting to load user data...');

            // Get token from local storage
            const token = localStorage.getItem('token');

            // Debug localStorage
            console.log('localStorage items:', Object.keys(localStorage));
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                console.log(`localStorage[${key}]:`, localStorage.getItem(key));
            }

            if (!token) {
                console.log('No token found in localStorage');
                throw new Error('No authentication token found');
            }

            console.log('Using token from localStorage:', token.substring(0, 20) + '...');

            // Make request with token in header
            const res = await axios.get(`${API_BASE_URL}/api/auth`, {
                headers: {
                    'x-auth-token': token
                }
            });

            console.log('User data loaded:', res.data);

            dispatch({
                type: 'USER_LOADED',
                payload: res.data
            });
        } catch (err) {
            console.error('Error loading user:', err.response?.data || err.message);
            dispatch({
                type: 'AUTH_ERROR',
                payload: err.response?.data?.msg || 'Server Error'
            });
        }
    };

    // Register User
    const register = async (formData) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            // Map username to name for backend compatibility
            const apiFormData = {
                name: formData.username,
                email: formData.email,
                password: formData.password
            };

            console.log('Sending registration request:', apiFormData);
            const res = await axios.post(`${API_BASE_URL}/api/auth/register`, apiFormData, config);
            console.log('Registration successful:', res.data);

            dispatch({
                type: 'REGISTER_SUCCESS',
                payload: res.data
            });

            // Add a small delay to ensure localStorage is updated
            setTimeout(() => {
                loadUser();
            }, 100);
        } catch (err) {
            console.error('Registration failed:', err.response?.data || err.message);

            const errorMessage = err.response?.data?.errors?.[0]?.msg ||
                err.response?.data?.msg ||
                'Registration failed';

            dispatch({
                type: 'REGISTER_FAIL',
                payload: errorMessage
            });
        }
    };

    // Login User
    const login = async (formData) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            console.log('Sending login request:', formData);
            const res = await axios.post(`${API_BASE_URL}/api/auth`, formData, config);
            console.log('Login successful:', res.data);

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: res.data
            });

            // Add a small delay to ensure localStorage is updated
            setTimeout(() => {
                loadUser();
            }, 100);
        } catch (err) {
            console.error('Login failed:', err.response?.data || err.message);

            const errorMessage = err.response?.data?.errors?.[0]?.msg ||
                err.response?.data?.msg ||
                'Login failed';

            dispatch({
                type: 'LOGIN_FAIL',
                payload: errorMessage
            });
        }
    };

    // Logout
    const logout = () => dispatch({ type: 'LOGOUT' });

    // Clear Errors
    const clearErrors = () => dispatch({ type: 'CLEAR_ERROR' });

    // Update User Profile
    const updateProfile = async (profileData) => {
        // Get token from local storage
        const token = localStorage.getItem('token');

        if (!token) {
            dispatch({
                type: 'AUTH_ERROR',
                payload: 'No authentication token found'
            });
            return;
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            }
        };

        try {
            console.log('Sending profile update request:', profileData);
            const res = await axios.put(`${API_BASE_URL}/api/auth/update`, profileData, config);
            console.log('Profile update successful:', res.data);

            dispatch({
                type: 'USER_LOADED',
                payload: res.data
            });

            return { success: true };
        } catch (err) {
            console.error('Profile update failed:', err.response?.data || err.message);

            const errorMessage = err.response?.data?.msg || 'Profile update failed';

            dispatch({
                type: 'AUTH_ERROR',
                payload: errorMessage
            });

            return { success: false, error: errorMessage };
        }
    };

    // Change Password
    const changePassword = async (passwordData) => {
        // Get token from local storage
        const token = localStorage.getItem('token');

        if (!token) {
            dispatch({
                type: 'AUTH_ERROR',
                payload: 'No authentication token found'
            });
            return;
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            }
        };

        try {
            console.log('Sending password change request');
            const res = await axios.put(`${API_BASE_URL}/api/auth/password`, passwordData, config);
            console.log('Password change successful');

            return { success: true, msg: res.data.msg };
        } catch (err) {
            console.error('Password change failed:', err.response?.data || err.message);

            const errorMessage = err.response?.data?.msg || 'Password change failed';

            return { success: false, error: errorMessage };
        }
    };

    // Delete Account
    const deleteAccount = async () => {
        // Get token from local storage
        const token = localStorage.getItem('token');

        if (!token) {
            dispatch({
                type: 'AUTH_ERROR',
                payload: 'No authentication token found'
            });
            return;
        }

        const config = {
            headers: {
                'x-auth-token': token
            }
        };

        try {
            console.log('Sending account deletion request');
            const res = await axios.delete(`${API_BASE_URL}/api/auth`, config);
            console.log('Account deletion successful:', res.data);

            dispatch({ type: 'LOGOUT' });

            return { success: true, msg: res.data.msg };
        } catch (err) {
            console.error('Account deletion failed:', err.response?.data || err.message);

            const errorMessage = err.response?.data?.msg || 'Account deletion failed';

            return { success: false, error: errorMessage };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                loading: state.loading,
                user: state.user,
                error: state.error,
                register,
                login,
                logout,
                loadUser,
                clearErrors,
                updateProfile,
                changePassword,
                deleteAccount
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}; 