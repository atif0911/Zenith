import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register, isAuthenticated, error, clearErrors } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    });

    const [alert, setAlert] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }

        if (error) {
            console.log('Error during registration:', error);
            setAlert(error);
            clearErrors();
        }
        // eslint-disable-next-line
    }, [isAuthenticated, error]);

    const { username, email, password, password2 } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (password !== password2) {
            setAlert('Passwords do not match');
        } else {
            console.log('Attempting to register with:', { username, email, password });
            register({
                username,
                email,
                password
            });
        }
    };

    return (
        <div className="auth-container">
            <h1>Join Zenith</h1>
            {alert && <div className="alert alert-danger">{alert}</div>}
            <p className="auth-intro">Create your Zenith account to start making smarter cryptocurrency investment decisions with AI-powered insights.</p>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        className="form-input"
                        value={username}
                        onChange={onChange}
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
                        value={email}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        className="form-input"
                        value={password}
                        onChange={onChange}
                        required
                        minLength="6"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password2">Confirm Password</label>
                    <input
                        type="password"
                        name="password2"
                        id="password2"
                        className="form-input"
                        value={password2}
                        onChange={onChange}
                        required
                        minLength="6"
                    />
                </div>
                <div className="form-group">
                    <button type="submit" className="btn btn-block">
                        Create Zenith Account
                    </button>
                </div>
            </form>
            <div className="auth-toggle">
                Already have a Zenith account? <Link to="/login">Login</Link>
            </div>
        </div>
    );
};

export default Register;

