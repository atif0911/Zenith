const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    console.log('[AUTH MIDDLEWARE] Request headers:', JSON.stringify(req.headers));
    console.log('[AUTH MIDDLEWARE] Token from header:', token ? `${token.substring(0, 20)}...` : 'none');

    // Check if not token
    if (!token) {
        console.log('[AUTH MIDDLEWARE] No token provided');
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        console.log('[AUTH MIDDLEWARE] Verifying token');
        const jwtSecret = config.get('jwtSecret');
        console.log('[AUTH MIDDLEWARE] JWT Secret available:', !!jwtSecret);

        const decoded = jwt.verify(token, jwtSecret);
        console.log('[AUTH MIDDLEWARE] Decoded token:', JSON.stringify(decoded));

        req.user = decoded.user;
        console.log('[AUTH MIDDLEWARE] Token verified for user:', req.user.id);
        next();
    } catch (err) {
        console.error('[AUTH MIDDLEWARE] Token verification failed:', err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
}; 