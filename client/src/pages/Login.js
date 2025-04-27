import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, error, clearErrors } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [alert, setAlert] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }

        if (error) {
            setAlert(error);
            clearErrors();
        }
        // eslint-disable-next-line
    }, [isAuthenticated, error]);

    const { email, password } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = (e) => {
        e.preventDefault();
        login(formData);
    };

    return (
        <div className="auth-container">
            <h1>Login to Zenith</h1>
            {alert && <div className="alert alert-danger">{alert}</div>}
            <form onSubmit={onSubmit}>
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
                    />
                </div>
                <div className="form-group">
                    <button type="submit" className="btn btn-block">
                        Access Your Zenith Account
                    </button>
                </div>
            </form>
            <div className="auth-toggle">
                New to Zenith? <Link to="/register">Create an account</Link>
            </div>
        </div>
    );
};

export default Login; 