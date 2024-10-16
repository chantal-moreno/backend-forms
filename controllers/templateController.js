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

module.exports = {
  newTemplate,
  updateTemplate,
  getTemplate,
};
