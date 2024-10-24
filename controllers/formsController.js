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

const getUserFormResponse = async (req, res) => {
  const { templateId } = req.params;
  const userId = req.user.id;

  try {
    const formResponse = await Form.findOne({ templateId, userId }).populate(
      'userId',
      'firstName lastName email'
    );

    res.status(200).json(formResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching form response' });
  }
};

const updateFormResponse = async (req, res) => {
  const { templateId } = req.params;
  const { answers } = req.body;
  const userId = req.user.id;

  // Need to send all array answers
  try {
    if (!answers || answers.length === 0) {
      return res.status(400).json({ message: 'Answers are required.' });
    }

    let formResponse = await Form.findOne({ templateId, userId });

    formResponse.answers = answers;

    await formResponse.save();

    res.status(200).json({
      message: 'Form response updated successfully.',
      formResponse,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating form response.' });
  }
};

const deleteFormResponse = async (req, res) => {
  const { templateId } = req.params;
  const userId = req.user.id;

  try {
    const formResponse = await Form.findOneAndDelete({ templateId, userId });

    if (!formResponse) {
      return res.status(404).json({ message: 'Form response not found.' });
    }

    res.status(200).json({ message: 'Form response deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting form response.' });
  }
};

const getTemplatesByFormResponseCount = async (req, res) => {
  try {
    // Perform aggregation to count responses by templateId
    const templatesWithResponseCount = await Form.aggregate([
      {
        $group: {
          _id: '$templateId', // Group by templateId
          answersCount: { $count: {} }, // Count answers
        },
      },
      {
        $lookup: {
          from: 'templates', // collection name
          localField: '_id', // Link with field _id (templateId)
          foreignField: '_id', // field _id collection templates
          as: 'template', // Result stored in the template field
        },
      },
      {
        $unwind: '$template', // Break down array de templates
      },
      {
        $lookup: {
          from: 'users', // Collection name
          localField: 'template.createdBy',
          foreignField: '_id',
          as: 'createdByUser',
        },
      },
      {
        $unwind: '$createdByUser',
      },
      {
        $addFields: {
          'template.createdBy': {
            _id: '$createdByUser._id',
            firstName: '$createdByUser.firstName',
            lastName: '$createdByUser.lastName',
          }, // Replace createdBy with _id, firstName y lastName
        },
      },
      {
        $sort: { answersCount: -1 }, // Sort by most responses
      },
      {
        $project: {
          _id: 0, // Do not show group _id
          template: 1, // Show template data
        },
      },
    ]);

    // templates array
    const templates = templatesWithResponseCount.map((item) => item.template);

    res.status(200).json({ templates });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: 'Error fetching templates', error: err.message });
  }
};

module.exports = {
  answerForm,
  getFormResponsesByTemplate,
  getUserFormResponse,
  updateFormResponse,
  deleteFormResponse,
  getTemplatesByFormResponseCount,
};
