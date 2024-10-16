const express = require('express');
const router = express.Router();
const { authRequired, isAdmin, authOptional } = require('../auth');

const templateController = require('../controllers/templateController');

router.post('/new-template', authRequired, templateController.newTemplate);
router.put(
  '/update-template/:templateId',
  authRequired,
  templateController.updateTemplate
);
router.get(
  '/template/:templateId',
  authOptional,
  templateController.getTemplate
);
router.get('/latest-templates', templateController.latestTemplates);
router.delete(
  '/delete-template/:templateId',
  authRequired,
  templateController.deleteTemplate
);

module.exports = router;
