import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  subHeading: {
    type: String,
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  icon: {
    type: String,
    required: true,
  },

  instruction: {
    type: String,
    required: true,
  },

  userInstruction: {
    type: String,
    required: true,
  },

  fallbackMessage: {
    type: String,
    required: true,
  },

  userPreference: {
    type: String,
  },

  model: {
    type: String,
    required: true,
  },

  themeColor: {
    type: String,
    required: true,
  },

  sampleQuestions: {
    type: [String],
    required: true,
  },

  placeholder: {
    type: String,
    required: true,
  },

  isDefault: {
    type: Boolean,
    default: false,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const UserAgentsModel = mongoose.models.UserAgents || mongoose.model('UserAgents', schema);
