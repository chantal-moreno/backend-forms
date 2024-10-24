const express = require('express');
const router = express.Router();
const { authRequired, isAdmin, authOptional } = require('../auth');

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
  authRequired,
  formController.getUserFormResponse
);

module.exports = router;
