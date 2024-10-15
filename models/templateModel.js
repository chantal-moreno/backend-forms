const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new mongoose.Schema(
  {
    questionTitle: { type: String, required: true },
    questionDescription: { type: String, required: true },
    questionType: { type: String, required: true },
    options: [String], // Options multiple choice questions
    order: { type: Number, required: true },
  },
  { _id: true }
);

const TemplateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    questions: [questionSchema],
    topic: { type: String },
    tags: [String],
    image: { type: String },
    isPublic: { type: Boolean, default: true },
    allowedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Templates', TemplateSchema);
