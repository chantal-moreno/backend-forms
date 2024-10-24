require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const User = require('./models/userModel');
const Template = require('./models/templateModel');
const Form = require('./models/formModel');

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

const checkTemplateOwnership = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    if (
      String(template.createdBy) !== String(req.user.id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Server error', error: err.message });
  }
};

const checkFormResponseOwnership = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const userId = req.user.id;
    const formResponse = await Form.findOne({ templateId, userId });

    if (!formResponse) {
      return res.status(404).json({ message: 'Form response not found' });
    }

    if (
      String(formResponse.userId) !== String(req.user.id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  authRequired,
  isAdmin,
  authOptional,
  checkTemplateOwnership,
  checkFormResponseOwnership,
};
