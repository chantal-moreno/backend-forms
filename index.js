const express = require('express');
const mongoose = require('mongoose');
const dbConnect = require('./dbConnect');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const User = require('./models/userModel');
const createAccessToken = require('./token');
const { authRequired, isAdmin } = require('./auth');
const validateSchema = require('./validator');
const { signUpSchema, signInSchema } = require('./authSchema');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const app = express();

dbConnect();
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// CORS (Cross-Origin Resource Sharing)
app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  response.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  if (request.method === 'OPTIONS') {
    return response.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(cookieParser());

app.get('/', function (req, res) {
  res.send('Hello');
});

// Sign up user
app.post('/sign-up', validateSchema(signUpSchema), async function (req, res) {
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
});

// Sign in user
app.post('/sign-in', validateSchema(signInSchema), async function (req, res) {
  const { email, password } = req.body;

  try {
    const userFound = await User.findOne({ email });
    if (!userFound) return res.status(400).json(['Invalid email or password']);

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) return res.status(400).json(['Invalid email or password']);

    // User blocked
    if (userFound.status == 'Blocked') {
      return res.status(400).json({
        message: 'User account is blocked',
      });
    }
    //Update lastLogin
    userFound.lastLogin = new Date();
    await userFound.save();
    // Token
    const token = await createAccessToken({
      id: userFound._id,
    });
    res.cookie('token', token);

    res.status(200).json({
      message: 'Sign In successfully',
      id: userFound._id,
      firstName: userFound.firstName,
      lastName: userFound.lastName,
      email: userFound.email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error to Sign In', error: error.message });
  }
});

// Sign out
app.post('/sign-out', function (req, res) {
  res.cookie('token', '', {
    expires: new Date(0),
  });
  return res.sendStatus(200);
});

// Verify token
app.get('/verify', async function (req, res) {
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
});

// Get user account
app.get('/account', authRequired, async function (req, res) {
  const userFound = await User.findById(req.user.id);
  if (!userFound) return res.status(400).json({ message: 'User not found' });

  return res.json({
    id: userFound._id,
    firstName: userFound.firstName,
    lastName: userFound.lastName,
    email: userFound.email,
    role: userFound.role,
  });
});

// Get all users
app.get('/all-users', authRequired, isAdmin, async (req, res) => {
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
});

// Block user
app.put('/block-users', authRequired, isAdmin, async (req, res) => {
  try {
    const { userIds } = req.body;
    const usersBlocked = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { status: 'Blocked' } }
    );

    if (usersBlocked.matchedCount === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.status(200).json({ message: 'Users blocked', usersBlocked });
  } catch (error) {
    res.status(500).json({
      message: 'Error blocking users',
      error: error.message,
    });
  }
});

// Unblock user
app.put('/unblock-users', authRequired, isAdmin, async (req, res) => {
  try {
    const { userIds } = req.body;
    const usersUnblocked = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { status: 'Active' } }
    );

    if (usersUnblocked.matchedCount === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    res.status(200).json({ message: 'Users unblocked', usersUnblocked });
  } catch (error) {
    res.status(500).json({
      message: 'Error unblocking users',
      error: error.message,
    });
  }
});

// Delete user
app.delete('/delete/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted', user });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting user',
      error: error.message,
    });
  }
});

// Add admin
app.put('/add-admin/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const newAdmin = await User.findByIdAndUpdate(
      userId,
      { $set: { role: 'admin' } },
      { new: true }
    );

    if (!newAdmin) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'New admin added', newAdmin });
  } catch (error) {
    res.status(500).json({
      message: 'Error adding new admin',
      error: error.message,
    });
  }
});

// Remove admin
app.put('/remove-admin/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const removeAdmin = await User.findByIdAndUpdate(
      userId,
      { $set: { role: 'user' } },
      { new: true }
    );

    if (!removeAdmin) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Admin removed', removeAdmin });
  } catch (error) {
    res.status(500).json({
      message: 'Error removing admin',
      error: error.message,
    });
  }
});
