import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, updateProfile, changePassword, deleteAccount, loadUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // Profile form state
    const [profileData, setProfileData] = useState({
        username: '',
        email: ''
    });

    // Password form state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // UI state
    const [editMode, setEditMode] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    // Set initial profile data from user context
    useEffect(() => {
        if (user) {
            setProfileData({
                username: user.username || '',
                email: user.email || ''
            });
        }
    }, [user]);

    // Handle loading or no user state
    if (!user) {
        return <div className="loading">Loading profile...</div>;
    }

    // Handle profile form changes
    const handleProfileChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        });
    };

    // Handle password form changes
    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    // Save profile changes
    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        // Clear previous messages
        setMessage(null);
        setError(null);

        const result = await updateProfile(profileData);

        if (result.success) {
            setMessage('Profile updated successfully');
            setEditMode(false);

            // Refresh user data
            loadUser();
        } else {
            setError(result.error);
        }
    };

    // Change password
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        // Clear previous messages
        setMessage(null);
        setError(null);

        // Validate passwords match
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        const result = await changePassword({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });

        if (result.success) {
            setMessage(result.msg || 'Password updated successfully');
            setShowPasswordForm(false);

            // Reset password form
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } else {
            setError(result.error);
        }
    };

    // Delete account
    const handleDeleteAccount = async () => {
        const result = await deleteAccount();

        if (result.success) {
            // Redirect to home page after successful deletion
            navigate('/');
        } else {
            setError(result.error);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="profile-container">
            <h1>Your Zenith Profile</h1>

            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card">
                {editMode ? (
                    <form onSubmit={handleProfileSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                name="username"
                                id="username"
                                className="form-input"
                                value={profileData.username}
                                onChange={handleProfileChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="form-input"
                                value={profileData.email}
                                onChange={handleProfileChange}
                                required
                            />
                        </div>
                        <div className="profile-actions">
                            <button type="submit" className="btn btn-primary">Save Changes</button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setEditMode(false);
                                    // Reset form data to original values
                                    if (user) {
                                        setProfileData({
                                            username: user.username || '',
                                            email: user.email || ''
                                        });
                                    }
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="profile-header">
                            <h2>{user.username}</h2>
                            <p>{user.email}</p>
                        </div>
                        <div className="profile-info">
                            <p>
                                <strong>Zenith Member Since:</strong>{' '}
                                {user.date ? new Date(user.date).toLocaleDateString() : 'N/A'}
                            </p>
                            <button
                                className="btn btn-primary"
                                onClick={() => setEditMode(true)}
                            >
                                Edit Zenith Profile
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Password Change Form */}
            <div className="card">
                <h3>Zenith Account Settings</h3>

                {showPasswordForm ? (
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                            <label htmlFor="currentPassword">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                id="currentPassword"
                                className="form-input"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                id="newPassword"
                                className="form-input"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength="6"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                id="confirmPassword"
                                className="form-input"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength="6"
                            />
                        </div>
                        <div className="profile-actions">
                            <button type="submit" className="btn btn-primary">Update Password</button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowPasswordForm(false);
                                    setPasswordData({
                                        currentPassword: '',
                                        newPassword: '',
                                        confirmPassword: ''
                                    });
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="profile-actions">
                        <button
                            className="btn"
                            onClick={() => setShowPasswordForm(true)}
                        >
                            Change Password
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            Delete Account
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Account Confirmation */}
            {showDeleteConfirm && (
                <div className="confirm-modal">
                    <div className="confirm-content">
                        <h3>Delete Account</h3>
                        <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                        <div className="confirm-actions">
                            <button
                                className="btn btn-danger"
                                onClick={handleDeleteAccount}
                            >
                                Yes, Delete My Account
                            </button>
                            <button
                                className="btn"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <h3>Subscription</h3>
                <p>You are currently on the <strong>Free Plan</strong>.</p>
                <p>Upgrade to Premium for more features!</p>
                <button className="btn btn-success">Upgrade Now</button>
            </div>
        </div>
    );
};

export default Profile; 