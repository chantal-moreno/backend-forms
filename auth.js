require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const User = require('./models/userModel');

const authRequired = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

const isAdmin = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (user && user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Only admin' });
  }
};

const authOptional = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) return next();

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return next();

    req.user = user;
    next();
  });
};

module.exports = { authRequired, isAdmin, authOptional };
