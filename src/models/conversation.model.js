import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  defaultAgentModel: {
    type: String,
    required: true,
  },

  currentAgentModel: {
    type: String,
    required: true,
  },

  mode: {
    type: String,
    enum: ['text', 'voice'],
    required: true,
  },

  customInstruction: {
    type: String,
  },

  title: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: Date,
});

conversationSchema.index({ userId: 1 });

export const ConversationModel =
  mongoose.models.Conversation ||
  mongoose.model('Conversation', conversationSchema);
