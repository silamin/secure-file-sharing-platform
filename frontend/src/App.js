import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Register from './pages/Register';

import Upload from './components/Upload';
import MyFiles from './pages/MyFiles';
import Auth from './pages/Auth';
import { DataProvider } from './contexts/DataContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './contexts/AuthContext';

const App = () => {
    const { isAuthenticated } = useAuth();
    const [authError, setAuthError] = useState('');

    return (
        <DataProvider>
            <Router>
                <Header isAuthenticated={isAuthenticated} />
                {authError && <div className="alert alert-danger text-center">{authError}</div>}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/auth" element={<Auth />} />
                    <Route path="/upload" element={isAuthenticated ? <Upload /> : <Navigate to="/" replace />} />
                    <Route path="/files" element={isAuthenticated ? <MyFiles /> : <Navigate to="/" replace />} />
                </Routes>
                <ToastContainer />
            </Router>
        </DataProvider>
    );
};

export default App;
