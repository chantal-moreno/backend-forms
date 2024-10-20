const Form = require('../models/formModel');

const answerForm = async (req, res) => {
  const { templateId } = req.params;
  const { answers } = req.body;

  try {
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

module.exports = {
  answerForm,
};
