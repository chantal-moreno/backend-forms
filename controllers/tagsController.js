const Tag = require('../models/tagModel');
const Template = require('../models/templateModel');
const addTagsToTemplate = require('../addTagsToTemplate');

const updateTags = async (req, res) => {
  try {
    const { tags } = req.body;
    const { templateId } = req.params;

    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const tagIds = await addTagsToTemplate(tags);

    template.tags = [...new Set([...template.tags, ...tagIds])];
    await template.save();

    res.status(200).json({
      message: 'Tags added successfully',
      template,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: 'Error updating template', error: err.message });
  }
};

module.exports = { updateTags };
