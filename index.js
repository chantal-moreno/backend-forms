const express = require('express');
const mongoose = require('mongoose');
const dbConnect = require('./dbConnect');
const bcrypt = require('bcrypt');
const User = require('./models/userModel');
const createAccessToken = require('./token');
const app = express();

dbConnect();
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// CORS (Cross-Origin Resource Sharing)
app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
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

app.get('/', function (req, res) {
  res.send('Hello');
});

// Sign up user
app.post('/sign-up', async function (req, res) {
  const { firstName, lastName, email, password } = req.body;

  // Verify that all required fields are present
  if (!firstName || !lastName || !email || !password) {
    return response.status(400).send({
      message:
        'Missing required fields: firstName, lastName, email, and password are required.',
    });
  }
  try {
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
app.post('/sign-in', async function (req, res) {
  const { email, password } = req.body;

  // Verify that all required fields are present
  if (!email || !password) {
    return response.status(400).send({
      message: 'Missing required fields: email, and password are required.',
    });
  }
  try {
    const userFound = await User.findOne({ email });
    if (!userFound)
      return res.status(400).json({ message: 'Incorrect email or password' });

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Incorrect email or password' });

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
