const express = require('express');
const router = express.Router();
const { authRequired, isAdmin } = require('../auth');

const templateController = require('../controllers/templateController');

router.post('/new-template', authRequired, templateController.newTemplate);
router.put(
  '/update-template/:templateId',
  authRequired,
  templateController.updateTemplate
);

module.exports = router;
