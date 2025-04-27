import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, logout } = useContext(AuthContext);
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    const authLinks = (
        <ul>
            <li>
                <Link to="/" className={isActive('/')}>
                    Home
                </Link>
            </li>
            <li>
                <Link to="/watchlist" className={isActive('/watchlist')}>
                    Zenith Watchlist
                </Link>
            </li>
            <li>
                <Link to="/predictions" className={isActive('/predictions')}>
                    AI Predictions
                </Link>
            </li>
            <li>
                <Link to="/profile" className={isActive('/profile')}>
                    My Account
                </Link>
            </li>
            <li>
                <button className="logout-btn" onClick={logout}>
                    Logout
                </button>
            </li>
        </ul>
    );

    const guestLinks = (
        <ul>
            <li>
                <Link to="/" className={isActive('/')}>
                    Home
                </Link>
            </li>
            <li>
                <Link to="/login" className={isActive('/login')}>
                    Login
                </Link>
            </li>
            <li>
                <Link to="/register" className={isActive('/register')}>
                    Join Zenith
                </Link>
            </li>
        </ul>
    );

    return (
        <nav className="navbar">
            <div className="logo">
                <h1>Zenith</h1>
            </div>
            {isAuthenticated ? authLinks : guestLinks}
        </nav>
    );
};

export default Navbar; 