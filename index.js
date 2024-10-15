const express = require('express');
const router = express.Router();
const usersRoutes = require('./routes/users');

router.use(usersRoutes);

module.exports = router;
