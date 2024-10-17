const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template.questions._id',
    required: true,
  },
  answerText: { type: String, required: true },
});

const formResponseSchema = new mongoose.Schema(
  {
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Templates',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    answers: [answerSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FormResponse', formResponseSchema);
