const Template = require('../models/templateModel');
const User = require('../models/userModel');

const newTemplate = async (req, res) => {
  try {
    const {
      title,
      description,
      questions,
      topic,
      tags,
      isPublic,
      allowedUsers,
      image,
    } = req.body;

    const newTemplate = new Template({
      title,
      description,
      questions,
      topic,
      tags,
      isPublic: isPublic !== undefined ? isPublic : true,
      allowedUsers: allowedUsers || [],
      image,
      createdBy: req.user.id,
    });

    await newTemplate.save();

    res.status(201).json({
      message: 'Template created successfully',
      template: newTemplate,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: 'Error creating template', error: error.message });
  }
};

const updateTemplate = async (req, res) => {
  const { templateId } = req.params;
  const {
    title,
    description,
    questions,
    topic,
    tags,
    isPublic,
    allowedUsers,
    image,
  } = req.body;

  try {
    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Verify creator or admin
    if (
      String(template.createdBy) !== String(req.user.id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        error: 'You do not have permission to edit this template',
      });
    }

    // Update only the fields that have been sent in the request body
    if (title !== undefined) template.title = title;
    if (description !== undefined) template.description = description;
    if (questions !== undefined) template.questions = questions;
    if (topic !== undefined) template.topic = topic;
    if (tags !== undefined) template.tags = tags;
    if (isPublic !== undefined) template.isPublic = isPublic;
    if (allowedUsers !== undefined) template.allowedUsers = allowedUsers;
    if (image !== undefined) template.image = image;

    await template.save();

    res.status(200).json({
      message: 'Template updated successfully',
      template,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating template' });
  }
};

const getTemplate = async (req, res) => {
  const { templateId } = req.params;

  try {
    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Verify if the template is public
    if (!template.isPublic) {
      //Private template
      // If the user don't have an account
      if (!req.user) {
        return res.status(403).json({
          error: 'Private template, access denied, not account',
        });
      }

      // Verify creator and allowed users
      const isCreator = String(template.createdBy.id) === String(req.user.id);
      const isAllowedUser = template.allowedUsers.includes(req.user.id);

      // Verify admin
      const user = await User.findById(req.user.id);
      const isAdmin = user.role === 'admin';

      if (!isCreator && !isAllowedUser && !isAdmin) {
        return res.status(403).json({
          error: 'Private template, access denied!',
        });
      }
    }
    // Read only mode
    let isReadOnly = false;
    if (!req.user) {
      isReadOnly = true;
    }

    res.status(200).json({
      template,
      readOnly: isReadOnly,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error getting template' });
  }
};

const latestTemplates = async (req, res) => {
  try {
    // Get templates sorted by creation date
    const templates = await Template.find().sort({ createdAt: -1 });

    res.status(200).json({ templates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error getting templates' });
  }
};

const deleteTemplate = async (req, res) => {
  const { templateId } = req.params;

  try {
    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Verify creator or admin
    if (
      String(template.createdBy) !== String(req.user.id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        error: 'You do not have permission to edit this template',
      });
    }

    await Template.findByIdAndDelete(templateId);

    res.status(200).json({ message: 'Template deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting template' });
  }
};

const addQuestion = async (req, res) => {
  const { templateId } = req.params;
  const { questionTitle, questionDescription, questionType, options, order } =
    req.body;

  try {
    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Verify creator or admin
    if (
      String(template.createdBy) !== String(req.user.id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        error: 'You do not have permission to edit this template',
      });
    }

    const newQuestion = {
      questionTitle,
      questionDescription,
      questionType,
      options,
      order,
    };

    await Template.findByIdAndUpdate(
      templateId,
      { $push: { questions: newQuestion } },
      { new: true } // get update template
    );

    res.status(200).json({ message: 'Question added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding question' });
  }
};

const updateQuestion = async (req, res) => {
  const { templateId, questionId } = req.params;
  const { questionTitle, questionDescription, questionType, options, order } =
    req.body;

  try {
    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Verify creator or admin
    if (
      String(template.createdBy) !== String(req.user.id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        error: 'You do not have permission to edit this template',
      });
    }

    const question = template.questions.id(questionId);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Update fields
    if (questionTitle) question.questionTitle = questionTitle;
    if (questionDescription) question.questionDescription = questionDescription;
    if (questionType) question.questionType = questionType;
    if (options) question.options = options;
    if (order !== undefined) question.order = order;

    await template.save();

    res
      .status(200)
      .json({ message: 'Question updated successfully', question });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating question' });
  }
};

const deleteQuestion = async (req, res) => {
  const { templateId, questionId } = req.params;

  try {
    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Verify creator or admin
    if (
      String(template.createdBy) !== String(req.user.id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        error: 'You do not have permission to edit this template',
      });
    }

    template.questions.pull(questionId);

    await template.save();

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting question' });
  }
};

module.exports = {
  newTemplate,
  updateTemplate,
  getTemplate,
  latestTemplates,
  deleteTemplate,
  addQuestion,
  updateQuestion,
  deleteQuestion,
};
