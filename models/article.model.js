/**
 * Article model for FactNet
 */

const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  article_id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  source: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'en'
  },
  category: {
    type: String,
    required: true
  },
  published_date: {
    type: Date,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  fact_check_score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  verified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verified_at: {
    type: Date
  },
  fact_checks: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    comment: String,
    evidence: [String],
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  user_feedback: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vote: {
      type: String,
      enum: ['upvote', 'downvote']
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }]
});

// Index for searching articles
ArticleSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Article', ArticleSchema);