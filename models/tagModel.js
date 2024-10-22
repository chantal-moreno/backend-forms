const mongoose = require('mongoose');
const { Schema } = mongoose;

const tagSchema = new Schema({
  name: { type: String, unique: true, required: true },
});

module.exports = mongoose.model('Tags', tagSchema);
