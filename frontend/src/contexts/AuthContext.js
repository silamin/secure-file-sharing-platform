import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/apiService';
import Cookies from 'js-cookie';

const AuthContext = createContext(false);

export const AuthProvider = ({ children }) => {
    const[isAuthenticated, setIsAuthenticated] = useState(false);

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
            await api.post('/auth/login', credentials);
            setIsAuthenticated(true);
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
            console.error('Error logging user out:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                handleLogin,
                handleRegister,
                handleLogout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
