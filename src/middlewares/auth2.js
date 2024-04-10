const jwt = require('jsonwebtoken');
const config = require('../config/jwt.json');

// JWT Middleware function
const jwtMiddleware = (req, res, next) => {
  // Get token from request headers, query parameters, or cookies
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : 
                req.query.token ? req.query.token : 
                req.cookies.token;

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Verify token
  jwt.verify(token, config.jwt.secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // Attach user information to request object
    req.user = decoded;
    next(); // Call next middleware
  });
};

module.exports = jwtMiddleware;
