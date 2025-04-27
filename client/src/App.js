import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import StatusBar from './components/layout/StatusBar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Watchlist from './pages/Watchlist';
import Predictions from './pages/Predictions';
import Profile from './pages/Profile';
import PrivateRoute from './components/routing/PrivateRoute';
import Footer from './components/layout/Footer';
import { AuthProvider, AuthContext } from './context/AuthContext';

import './App.css';

const AppContent = () => {
    const { loadUser } = useContext(AuthContext);

    useEffect(() => {
        loadUser();
        // eslint-disable-next-line
    }, []);

    return (
        <Router>
            <div className="app">
                <Navbar />
                <StatusBar />
                <div className="container">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/watchlist"
                            element={
                                <PrivateRoute>
                                    <Watchlist />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/predictions"
                            element={
                                <PrivateRoute>
                                    <Predictions />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <PrivateRoute>
                                    <Profile />
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </div>
                <Footer />
            </div>
        </Router>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App; 