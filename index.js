const express = require('express');
const router = express.Router();
const usersRoutes = require('./routes/users');
const templateRoutes = require('./routes/templates');

router.use(usersRoutes);
router.use(templateRoutes);

module.exports = router;
