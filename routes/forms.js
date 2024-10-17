const express = require('express');
const router = express.Router();
const { authRequired, isAdmin, authOptional } = require('../auth');

const formController = require('../controllers/formsController');

router.post(
  '/template/:templateId/submit-answers',
  authRequired,
  formController.answerForm
);

module.exports = router;
