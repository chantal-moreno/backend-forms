const Tag = require('./models/tagModel');

const addTagsToTemplate = async (tags) => {
  if (!Array.isArray(tags)) {
    throw new TypeError('Tags must be an array');
  }

  const tagIds = [];

  for (const tagName of tags) {
    let tag = await Tag.findOne({ name: tagName });

    if (!tag) {
      tag = new Tag({ name: tagName });
      await tag.save();
    }

    tagIds.push(tag._id);
  }

  return tagIds;
};

module.exports = addTagsToTemplate;
