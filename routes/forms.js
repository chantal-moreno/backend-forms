const express = require('express');
const router = express.Router();
const {
  authRequired,
  isAdmin,
  authOptional,
  checkFormResponseOwnership,
} = require('../auth');

const formController = require('../controllers/formsController');

router.post(
  '/template/:templateId/submit-answers',
  authRequired,
  formController.answerForm
);

router.get(
  '/templates/:templateId/form-responses',
  authRequired,
  formController.getFormResponsesByTemplate
);
router.get(
  '/templates/:templateId/user-form-responses',
  authOptional,
  checkFormResponseOwnership,
  formController.getUserFormResponse
);
router.put(
  '/templates/:templateId/update-form-response',
  authRequired,
  checkFormResponseOwnership,
  formController.updateFormResponse
);
router.delete(
  '/templates/:templateId/form-response',
  authRequired,
  checkFormResponseOwnership,
  formController.deleteFormResponse
);
module.exports = router;
