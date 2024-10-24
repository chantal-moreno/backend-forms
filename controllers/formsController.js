const Form = require('../models/formModel');

const answerForm = async (req, res) => {
  const { templateId } = req.params;
  const { answers } = req.body;

  try {
    if (!answers || answers.length === 0) {
      return res.status(400).json({ error: 'Answers are required' });
    }
    const formResponse = new Form({
      templateId,
      userId: req.user.id,
      answers,
    });

    await formResponse.save();

    res
      .status(200)
      .json({ message: 'Answers sent successfully', formResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error sending answers' });
  }
};

const getFormResponsesByTemplate = async (req, res) => {
  const { templateId } = req.params;

  try {
    const formResponses = await Form.find({ templateId }).populate(
      'userId',
      'firstName lastName email'
    );

    if (!formResponses || formResponses.length === 0) {
      return res
        .status(404)
        .json({ message: 'No form responses found for this template' });
    }

    res.status(200).json(formResponses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching form responses' });
  }
};

module.exports = {
  answerForm,
  getFormResponsesByTemplate,
};
