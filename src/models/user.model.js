import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },

  token: {
    type: Number,
    default: 10000,
  },

  password: {
    type: String,
    default: null,
  },

  emailVerified: {
    type: Date,
    default: null,
  },

  image: {
    type: String,
    default: null,
  },
});

export const UserModel =
  mongoose.models.User || mongoose.model('User', userSchema);
