const express = require('express');
const router = express.Router();
const Article = require('../models/article.model');
const logger = require('../config/logger');

// Get all articles with pagination, sorting, and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filter parameters
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Execute query with pagination
    const articles = await Article.find(filter)
      .sort({ published_date: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Article.countDocuments(filter);
    
    res.json({
      articles,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalArticles: total
    });
  } catch (err) {
    logger.error('Error fetching articles:', err);
    res.status(500).json({ message: 'Error fetching articles' });
  }
});

// Get single article by ID
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findOne({ article_id: req.params.id });
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    res.json(article);
  } catch (err) {
    logger.error('Error fetching article:', err);
    res.status(500).json({ message: 'Error fetching article' });
  }
});

// Simplified version - without authentication checks
router.post('/:id/feedback', async (req, res) => {
  try {
    const { vote } = req.body;
    if (!vote || !['upvote', 'downvote'].includes(vote)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }
    
    const article = await Article.findOne({ article_id: req.params.id });
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // Just increment the vote count
    if (vote === 'upvote') {
      article.upvotes += 1;
    } else {
      article.downvotes += 1;
    }
    
    await article.save();
    
    res.json({ 
      message: 'Feedback submitted successfully',
      upvotes: article.upvotes,
      downvotes: article.downvotes
    });
  } catch (err) {
    logger.error('Error submitting feedback:', err);
    res.status(500).json({ message: 'Error submitting feedback' });
  }
});

module.exports = router;