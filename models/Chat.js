// models/Chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  isUser: {
    type: Boolean,
    required: true
  },
  userEmotion: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'confused', 'worried', 'neutral'],
    default: 'neutral'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Optional: Store conversation context
  conversationId: {
    type: String,
    default: function() {
      return `conv_${this.userId}_${Date.now()}`;
    }
  }
}, {
  timestamps: true
});

// Index for efficient querying
chatSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Chat', chatSchema);
