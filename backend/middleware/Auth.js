const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = { id: decoded.user.id };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;

// This middleware function checks for a JWT token in the request header. If the token is present, it is verified using the 'your_jwt_secret' key.
// If the token is valid, the user's ID is extracted from the token and set on the request object as req.user.id.
// If the token is not present or not valid, a 401 status code is returned with a message indicating the issue.