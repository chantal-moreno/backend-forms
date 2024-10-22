const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
    options: [String], // Options multiple choice questions
    order: { type: String },
  },
  { _id: true }
);

const TemplateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    questions: {
      type: [questionSchema],
      required: true,
      validate: [arrayLimit, 'At least one question'],
    },
    topic: {
      type: String,
      required: true,
      enum: ['Education', 'Personal', 'Work', 'Other'],
    },
    tags: [String],
    image: { type: String },
    isPublic: { type: Boolean, default: true },
    allowedUsers: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  },
  {
    timestamps: true,
  }
);

function arrayLimit(val) {
  return val.length > 0;
}

module.exports = mongoose.model('Templates', TemplateSchema);
