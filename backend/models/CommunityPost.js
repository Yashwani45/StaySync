const mongoose = require('mongoose');

const CommunityPostSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
      index: true
    },
    city: {
      type: String,
      default: 'Indore',
      index: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorName: {
      type: String,
      required: true
    },
    authorRole: {
      type: String,
      default: 'Resident'
    },
    title: {
      type: String,
      required: [true, 'Post title is required']
    },
    content: {
      type: String,
      required: [true, 'Post content is required']
    },
    type: {
      type: String,
      enum: ['Announcement', 'Discussion', 'Event', 'Lost & Found'],
      default: 'Discussion',
      index: true
    },
    pinned: {
      type: Boolean,
      default: false
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        authorName: String,
        authorRole: String,
        text: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    reported: {
      type: Boolean,
      default: false
    },
    moderationStatus: {
      type: String,
      enum: ['Visible', 'Flagged', 'Removed'],
      default: 'Visible',
      index: true
    }
  },
  {
    timestamps: true
  }
);

CommunityPostSchema.index({ city: 1, createdAt: -1 });

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);
