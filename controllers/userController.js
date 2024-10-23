const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const createAccessToken = require('../token');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const signUP = async function (req, res) {
  const { firstName, lastName, email, password } = req.body;

  try {
    const userFound = await User.findOne({ email });
    if (userFound) return res.status(400).json(['This email already exists']);

    // New user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    // Token
    const token = await createAccessToken({
      id: newUser._id,
    });
    res.cookie('token', token);

    res.status(200).json({
      message: 'User created successfully',
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error creating user', error: error.message });
  }
};

const signIN = async function (req, res) {
  const { email, password } = req.body;

  try {
    const userFound = await User.findOne({ email });
    if (!userFound) return res.status(400).json(['Invalid email or password']);

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) return res.status(400).json(['Invalid email or password']);

    // User blocked
    if (userFound.status == 'Blocked') {
      return res.status(400).json(['User account is blocked']);
    }
    //Update lastLogin
    userFound.lastLogin = new Date();
    await userFound.save();
    // Token
    const token = await createAccessToken({
      id: userFound._id,
      role: userFound.role,
    });
    res.cookie('token', token);

    res.status(200).json({
      message: 'Sign In successfully',
      id: userFound._id,
      firstName: userFound.firstName,
      lastName: userFound.lastName,
      email: userFound.email,
      role: userFound.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error to Sign In', error: error.message });
  }
};

const signOUT = function (req, res) {
  res.cookie('token', '', {
    expires: new Date(0),
  });
  return res.sendStatus(200);
};

const account = async function (req, res) {
  const userFound = await User.findById(req.user.id);
  if (!userFound) return res.status(400).json({ message: 'User not found' });

  return res.json({
    id: userFound._id,
    firstName: userFound.firstName,
    lastName: userFound.lastName,
    email: userFound.email,
    role: userFound.role,
  });
};

const verifyToken = async function (req, res) {
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });

    const userFound = await User.findById(user.id);
    if (!userFound)
      return res.status(401).json({ message: 'Unauthorized user not found' });

    return res.status(200).json({
      id: userFound._id,
      firstName: userFound.firstName,
      lastName: userFound.lastName,
      email: userFound.email,
      role: userFound.role,
    });
  });
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select(
      'firstName lastName email role status lastLogin'
    );

    res.status(200).json({
      message: 'Users retrieved successfully',
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving users',
      error: error.message,
    });
  }
};

const blockUsers = async (req, res) => {
  try {
    const { userIds } = req.body;
    const usersBlocked = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { status: 'Blocked' } }
    );

    if (usersBlocked.matchedCount === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res
      .status(200)
      .json({ message: 'Users blocked successfully!', usersBlocked });
  } catch (error) {
    res.status(500).json({
      message: 'Error blocking users',
      error: error.message,
    });
  }
};

const unblockUsers = async (req, res) => {
  try {
    const { userIds } = req.body;
    const usersUnblocked = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { status: 'Active' } }
    );

    if (usersUnblocked.matchedCount === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    res
      .status(200)
      .json({ message: 'Users unblocked successfully!', usersUnblocked });
  } catch (error) {
    res.status(500).json({
      message: 'Error unblocking users',
      error: error.message,
    });
  }
};

const deleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;
    const usersDeleted = await User.deleteMany({ _id: { $in: userIds } });

    if (!usersDeleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    res
      .status(200)
      .json({ message: 'Users deleted successfully!', usersDeleted });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting users',
      error: error.message,
    });
  }
};

const addAdmin = async (req, res) => {
  try {
    const { userIds } = req.body;
    const newAdmins = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { role: 'admin' } }
    );

    if (!newAdmins) {
      return res.status(404).json({ message: 'No users found' });
    }
    res
      .status(200)
      .json({ message: 'New admins added successfully!', newAdmins });
  } catch (error) {
    res.status(500).json({
      message: 'Error adding new admins',
      error: error.message,
    });
  }
};

const removeAdmin = async (req, res) => {
  try {
    const { userIds } = req.body;
    const removeAdmins = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { role: 'user' } }
    );

    if (!removeAdmins) {
      return res.status(404).json({ message: 'No users found' });
    }
    res
      .status(200)
      .json({ message: 'Admins removed successfully!', removeAdmins });
  } catch (error) {
    res.status(500).json({
      message: 'Error removing admins',
      error: error.message,
    });
  }
};

module.exports = {
  signUP,
  signIN,
  signOUT,
  account,
  verifyToken,
  getUsers,
  blockUsers,
  unblockUsers,
  deleteUsers,
  addAdmin,
  removeAdmin,
};
