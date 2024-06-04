import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/apiService';

const AuthContext = createContext(false);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const verifyToken = async () => {
        try {
            const response = await api.get('/auth/verify');
            if (response.status === 200) {
                setIsAuthenticated(true);
            }
        } catch (error) {
            setIsAuthenticated(false);
            console.error('Error verifying token:', error);
        }
    };

    useEffect(() => {
        verifyToken();
    }, []);

    const handleLogin = async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            if (response.data.userId) {
                return response.data.userId;
            } else {
                setIsAuthenticated(true);
                return null;
            }
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    };


    const handleRegister = async (user) => {
        try {
            await api.post('/auth/register', user);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    };

    const enableMfa = async () => {
        try {
            const response = await api.post('/mfa/enable');
            return response.data.dataUrl;
        } catch (error) {
            console.error('Error enabling MFA:', error);
            throw error;
        }
    };

    const disableMfa = async () => {
        try {
            await api.post('/mfa/disable');
        } catch (error) {
            console.error('Error disabling MFA:', error);
            throw error;
        }
    };

    const verifyMfa = async ({ token, userId }) => {
        try {
            const response = await api.post('/mfa/verify', { token, userId });
            setIsAuthenticated(true);
            return response.data;
        } catch (error) {
            console.error('Error verifying MFA:', error);
            throw error;
        }
    };

    const checkMfa = async () => {
        try {
            const response = await api.get('/mfa/check');
            return response.data.mfaEnabled;
        } catch (error) {
            console.error('Error checking MFA:', error);
            throw error;
        }
    };
    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                handleLogin,
                handleRegister,
                handleLogout,
                enableMfa,
                disableMfa,
                verifyMfa,
                checkMfa
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
