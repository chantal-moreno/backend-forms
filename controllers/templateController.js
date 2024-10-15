const Template = require('../models/templateModel');

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

module.exports = {
  newTemplate,
};
