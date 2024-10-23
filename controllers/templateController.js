const Template = require('../models/templateModel');
const User = require('../models/userModel');
const addTagsToTemplate = require('../addTagsToTemplate');

const newTemplate = async (req, res) => {
  try {
    const {
      title,
      description,
      questions,
      topic,
      tags = [],
      isPublic,
      allowedUsers,
      image,
    } = req.body;

    if (!questions || questions.length === 0) {
      return res
        .status(400)
        .json({ message: 'At least one question is required.' });
    }
    if (topic == 'Select template topic') {
      return res.status(400).json({ message: 'Select template topic' });
    }
    if (tags.length === 0) {
      return res.status(400).json({ message: 'At least one tag is required' });
    }

    const isPublicBoolean =
      isPublic === 'false' || isPublic === false ? false : true;
    if (!isPublicBoolean && (!allowedUsers || allowedUsers.length === 0)) {
      return res.status(400).json({
        message:
          'For private templates, at least one allowed user is required.',
      });
    }

    const tagIds = await addTagsToTemplate(tags);

    const newTemplate = new Template({
      title,
      description,
      questions,
      topic,
      tags: tagIds,
      isPublic: isPublic !== undefined ? isPublic : true,
      allowedUsers: allowedUsers || [],
      image: image || '',
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
      .json({ message: 'Error creating template', error: err.message });
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
    const template = await Template.findById(templateId).populate(
      'tags',
      'name'
    );

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
const allTemplates = async (req, res) => {
  try {
    const templates = await Template.find().populate(
      'createdBy',
      'firstName lastName'
    );

    res.status(200).json({ templates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error getting templates' });
  }
};

const latestTemplates = async (req, res) => {
  try {
    // Get templates sorted by creation date
    const templates = await Template.find()
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({ templates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error getting templates' });
  }
};

const deleteTemplate = async (req, res) => {
  const { templateId } = req.params;

  try {
    await Template.findByIdAndDelete(templateId);

    res.status(200).json({ message: 'Template deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting template' });
  }
};

const getTemplatesByTag = async (req, res) => {
  try {
    const { tagId } = req.params;
    const templates = await Template.find({ tags: tagId }).populate('tags');

    if (!templates) {
      return res
        .status(404)
        .json({ message: 'No templates found for this tag' });
    }

    res.status(200).json(templates);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: 'Error fetching templates', error: err.message });
  }
};

const addQuestion = async (req, res) => {
  const { templateId } = req.params;
  const { questionTitle, questionDescription, questionType, options, order } =
    req.body;

  try {
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
  allTemplates,
  latestTemplates,
  deleteTemplate,
  getTemplatesByTag,
  addQuestion,
  updateQuestion,
  deleteQuestion,
};
