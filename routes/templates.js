const express = require('express');
const router = express.Router();
const {
  authRequired,
  isAdmin,
  authOptional,
  checkTemplateOwnership,
} = require('../auth');

const templateController = require('../controllers/templateController');

router.post('/new-template', authRequired, templateController.newTemplate);
router.put(
  '/update-template/:templateId',
  authRequired,
  checkTemplateOwnership,
  templateController.updateTemplate
);
router.get(
  '/template/:templateId',
  authOptional,
  templateController.getTemplate
);
router.get('/all-templates', templateController.allTemplates);
router.get('/latest-templates', templateController.latestTemplates);
router.delete(
  '/delete-template/:templateId',
  authRequired,
  checkTemplateOwnership,
  templateController.deleteTemplate
);
router.get(
  '/templates/tag/:tagId',
  authOptional,
  templateController.getTemplatesByTag
);
router.post(
  '/template/:templateId/add-question',
  authRequired,
  checkTemplateOwnership,
  templateController.addQuestion
);
router.post(
  '/template/:templateId/update-question/:questionId',
  authRequired,
  checkTemplateOwnership,
  templateController.updateQuestion
);
router.delete(
  '/template/:templateId/delete-question/:questionId',
  authRequired,
  checkTemplateOwnership,
  templateController.deleteQuestion
);

module.exports = router;
