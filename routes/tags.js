const express = require('express');
const router = express.Router();
const {
  authRequired,
  isAdmin,
  authOptional,
  checkTemplateOwnership,
} = require('../auth');

const tagController = require('../controllers/tagsController');

router.patch(
  '/templates/:templateId/tags',
  authRequired,
  checkTemplateOwnership,
  tagController.updateTags
);

module.exports = router;
