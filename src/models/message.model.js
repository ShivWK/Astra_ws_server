import mongoose from 'mongoose';

const messagesSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  role: {
    type: String,
    enum: ['user', 'system', 'assistant'],
    required: true,
  },

  content: {
    type: String,
    required: true,
  },

  tokenUsage: {
    type: Number,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const MessagesModel =
  mongoose.models.Messages || mongoose.model('Messages', messagesSchema);
