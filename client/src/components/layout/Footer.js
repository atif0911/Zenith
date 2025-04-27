import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-links">
                        <Link to="/about" className="footer-link">
                            About
                        </Link>
                        <Link to="/privacy" className="footer-link">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="footer-link">
                            Terms of Service
                        </Link>
                    </div>
                    <div className="social-icons">
                        {/* Placeholder for social icons */}
                        <a href="https://twitter.com" className="social-icon" target="_blank" rel="noreferrer">
                            Twitter
                        </a>
                        <a href="https://discord.com" className="social-icon" target="_blank" rel="noreferrer">
                            Discord
                        </a>
                        <a href="https://github.com" className="social-icon" target="_blank" rel="noreferrer">
                            GitHub
                        </a>
                    </div>
                    <div className="copyright">
                        &copy; {new Date().getFullYear()} AI Crypto Trading Platform. All Rights Reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 