/**
 * FactNet Configuration
 * Contains global configuration settings for the application
 */

// API Base URL - change this to match your backend server
const API_BASE_URL = 'http://localhost:5000/api';

// Available categories
const CATEGORIES = [
  'Politics',
  'Technology',
  'Health',
  'Business',
  'Science',
  'Sports',
  'Miscellaneous'
];

// Fact check score ranges
const SCORE_RANGES = {
  HIGH: { min: 70, label: 'Highly Accurate', class: 'score-high' },
  MEDIUM: { min: 40, label: 'Somewhat Accurate', class: 'score-medium' },
  LOW: { min: 0, label: 'Questionable', class: 'score-low' }
};

// Local storage keys
const STORAGE_KEYS = {
  BOOKMARKS: 'factnet_bookmarks',
  PREFERENCES: 'factnet_preferences'
};

// Date formatting options
const DATE_FORMAT_OPTIONS = {
  full: { year: 'numeric', month: 'long', day: 'numeric' },
  medium: { year: 'numeric', month: 'short', day: 'numeric' },
  short: { month: 'short', day: 'numeric' }
};

// Article list pagination settings
const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_BUTTONS: 5
};