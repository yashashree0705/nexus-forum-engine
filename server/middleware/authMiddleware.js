const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Grab security bearer token from network request headers
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authorization denied. Token signature missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Bind validated user entity reference parameters to request stream
    next();
  } catch (err) {
    res.status(401).json({ message: 'Session payload manipulation validation failed.' });
  }
};