const express = require('express');
const router = express.Router();
const usersRoutes = require('./routes/users');
const templateRoutes = require('./routes/templates');
const formRoutes = require('./routes/forms');
const tagRoutes = require('./routes/tags');

router.use(usersRoutes);
router.use(templateRoutes);
router.use(formRoutes);
router.use(tagRoutes);

module.exports = router;
