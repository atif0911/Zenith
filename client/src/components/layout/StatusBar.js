import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';

const StatusBar = () => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Clean up event listeners
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <div className="status-bar">
            <div className="status">
                <div className={`indicator ${isOnline ? 'online' : 'offline'}`}></div>
                <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <div>
                {isAuthenticated && user ? `Welcome, ${user.username}` : 'Not logged in'}
            </div>
        </div>
    );
};

export default StatusBar; 