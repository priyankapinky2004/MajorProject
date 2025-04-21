/**
 * JavaScript for Article Detail Page
 * Handles displaying article details and user interactions
 */

// DOM elements
const articleContent = document.getElementById('article-content');
const articleLoading = document.getElementById('article-loading');
const articleError = document.getElementById('article-error');
const errorMessage = document.getElementById('error-message');

// Article elements
const articleTitle = document.getElementById('article-title');
const articleTitleShort = document.getElementById('article-title-short');
const articleCategory = document.getElementById('article-category');
const articleSource = document.getElementById('article-source');
const articleDate = document.getElementById('article-date');
const articleDescription = document.getElementById('article-description');
const originalArticleLink = document.getElementById('original-article-link');
const factCheckProgress = document.getElementById('fact-check-progress');
const factCheckLabel = document.getElementById('fact-check-label');
const upvoteBtn = document.getElementById('upvote-btn');
const downvoteBtn = document.getElementById('downvote-btn');
const upvoteCount = document.getElementById('upvote-count');
const downvoteCount = document.getElementById('downvote-count');
const voteLoginMessage = document.getElementById('vote-login-message');
const voteSuccessMessage = document.getElementById('vote-success-message');
const voteErrorMessage = document.getElementById('vote-error-message');
const shareBtn = document.getElementById('share-btn');
const bookmarkBtn = document.getElementById('bookmark-btn');
const relatedArticlesContainer = document.getElementById('related-articles-container');

// Current article data
let currentArticle = null;

/**
 * Initialize the page
 */
async function init() {
  try {
    // Get article ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    
    if (!articleId) {
      showError('No article ID specified');
      return;
    }
    
    // Load article data
    await loadArticleData(articleId);
    
    // Set up event listeners
    setupEventListeners();
    
    // Load related articles
    loadRelatedArticles();
    
  } catch (error) {
    console.error('Error initializing article page:', error);
    showError('Error loading article. Please try again later.');
  }
}

/**
 * Load article data by ID
 * @param {string} articleId - The article ID to load
 */
async function loadArticleData(articleId) {
  try {
    // Show loading state
    if (articleLoading) articleLoading.style.display = 'block';
    if (articleContent) articleContent.style.display = 'none';
    if (articleError) articleError.style.display = 'none';
    
    // Fetch article data
    currentArticle = await articleService.getArticleById(articleId);
    
    // Update page title
    document.title = `${currentArticle.title} - FactNet`;
    
    // Update article content
    updateArticleContent();
    
    // Show article content
    if (articleLoading) articleLoading.style.display = 'none';
    if (articleContent) articleContent.style.display = 'block';
    
  } catch (error) {
    console.error('Error loading article:', error);
    showError('Article not found or error loading article');
  }
}

/**
 * Update the article content with loaded data
 */
function updateArticleContent() {
  if (!currentArticle) return;
  
  // Set article title
  if (articleTitle) articleTitle.textContent = currentArticle.title;
  if (articleTitleShort) {
    const shortTitle = currentArticle.title.length > 30 
      ? currentArticle.title.substring(0, 30) + '...' 
      : currentArticle.title;
    articleTitleShort.textContent = shortTitle;
  }
  
  // Set article category
  if (articleCategory) {
    articleCategory.textContent = currentArticle.category;
    articleCategory.href = `index.html?category=${currentArticle.category}`;
  }
  
  // Set article source
  if (articleSource) articleSource.textContent = currentArticle.source;
  
  // Set article date
  if (articleDate) {
    articleDate.textContent = articleService.formatDate(currentArticle.published_date, 'full');
  }
  
  // Set article description
  if (articleDescription) articleDescription.textContent = currentArticle.description;
  
  // Set original article link
  if (originalArticleLink) originalArticleLink.href = currentArticle.url;
  
  // Set fact check score
  if (factCheckProgress) {
    factCheckProgress.style.width = `${currentArticle.fact_check_score}%`;
    factCheckProgress.setAttribute('aria-valuenow', currentArticle.fact_check_score);
    factCheckProgress.textContent = `${currentArticle.fact_check_score}%`;
    
    // Update color based on score
    const scoreInfo = articleService.getScoreInfo(currentArticle.fact_check_score);
    factCheckProgress.className = `progress-bar ${scoreInfo.class}`;
    
    if (factCheckLabel) {
      factCheckLabel.textContent = `${currentArticle.fact_check_score}% ${scoreInfo.label}`;
      factCheckLabel.className = `badge ${scoreInfo.class}`;
    }
  }
  
  // Set vote counts
  if (upvoteCount) upvoteCount.textContent = currentArticle.upvotes;
  if (downvoteCount) downvoteCount.textContent = currentArticle.downvotes;
  
  // Check if user is logged in for voting
  const isLoggedIn = authService.isAuthenticated;
  if (!isLoggedIn && voteLoginMessage) {
    voteLoginMessage.style.display = 'block';
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Vote buttons
  if (upvoteBtn) {
    upvoteBtn.addEventListener('click', () => submitVote('upvote'));
  }
  
  if (downvoteBtn) {
    downvoteBtn.addEventListener('click', () => submitVote('downvote'));
  }
  
  // Share button
  if (shareBtn) {
    shareBtn.addEventListener('click', (e) => {
      e.preventDefault();
      shareArticle();
    });
  }
  
  // Bookmark button
  if (bookmarkBtn) {
    bookmarkBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleBookmark();
    });
    
    // Update bookmark button state
    updateBookmarkState();
  }
}

/**
 * Submit a vote (upvote/downvote)
 * @param {string} voteType - Type of vote ('upvote' or 'downvote')
 */
async function submitVote(voteType) {
  if (!currentArticle) return;
  
  // Check if user is logged in
  if (!authService.isAuthenticated) {
    if (voteLoginMessage) voteLoginMessage.style.display = 'block';
    return;
  }
  
  try {
    // Hide any previous messages
    if (voteSuccessMessage) voteSuccessMessage.style.display = 'none';
    if (voteErrorMessage) voteErrorMessage.style.display = 'none';
    
    // Submit vote
    const result = await articleService.submitFeedback(currentArticle.article_id, voteType);
    
    // Update vote counts
    if (upvoteCount) upvoteCount.textContent = result.upvotes;
    if (downvoteCount) downvoteCount.textContent = result.downvotes;
    
    // Update current article data
    currentArticle.upvotes = result.upvotes;
    currentArticle.downvotes = result.downvotes;
    
    // Show success message
    if (voteSuccessMessage) {
      voteSuccessMessage.style.display = 'block';
      
      // Hide message after 3 seconds
      setTimeout(() => {
        voteSuccessMessage.style.display = 'none';
      }, 3000);
    }
    
  } catch (error) {
    console.error('Error submitting vote:', error);
    
    // Show error message
    if (voteErrorMessage) {
      voteErrorMessage.style.display = 'block';
      voteErrorMessage.textContent = 'Error submitting your vote. Please try again.';
    }
  }
}

/**
 * Share the current article
 */
function shareArticle() {
  if (!currentArticle) return;
  
  // Check if Web Share API is available
  if (navigator.share) {
    navigator.share({
      title: currentArticle.title,
      text: `Check out this article on FactNet: ${currentArticle.title}`,
      url: window.location.href
    })
    .then(() => console.log('Article shared successfully'))
    .catch((error) => console.error('Error sharing article:', error));
  } else {
    // Fallback - copy URL to clipboard
    const tempInput = document.createElement('input');
    document.body.appendChild(tempInput);
    tempInput.value = window.location.href;
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    alert('Article URL copied to clipboard!');
  }
}

/**
 * Toggle bookmark status for the current article
 */
function toggleBookmark() {
  if (!currentArticle) return;
  
  // Get current bookmarks from local storage
  const bookmarksJSON = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
  let bookmarks = bookmarksJSON ? JSON.parse(bookmarksJSON) : [];
  
  // Check if article is already bookmarked
  const index = bookmarks.findIndex(b => b.article_id === currentArticle.article_id);
  
  if (index === -1) {
    // Add bookmark
    bookmarks.push({
      article_id: currentArticle.article_id,
      title: currentArticle.title,
      source: currentArticle.source,
      date: currentArticle.published_date,
      category: currentArticle.category,
      date_bookmarked: new Date().toISOString()
    });
    
    if (bookmarkBtn) {
      bookmarkBtn.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
      bookmarkBtn.classList.remove('btn-outline-primary');
      bookmarkBtn.classList.add('btn-primary');
    }
  } else {
    // Remove bookmark
    bookmarks.splice(index, 1);
    
    if (bookmarkBtn) {
      bookmarkBtn.innerHTML = '<i class="far fa-bookmark"></i> Save';
      bookmarkBtn.classList.remove('btn-primary');
      bookmarkBtn.classList.add('btn-outline-primary');
    }
  }
  
  // Save updated bookmarks to local storage
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
}

/**
 * Update bookmark button state based on whether article is bookmarked
 */
function updateBookmarkState() {
  if (!currentArticle || !bookmarkBtn) return;
  
  // Get current bookmarks from local storage
  const bookmarksJSON = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
  const bookmarks = bookmarksJSON ? JSON.parse(bookmarksJSON) : [];
  
  // Check if article is already bookmarked
  const isBookmarked = bookmarks.some(b => b.article_id === currentArticle.article_id);
  
  if (isBookmarked) {
    bookmarkBtn.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
    bookmarkBtn.classList.remove('btn-outline-primary');
    bookmarkBtn.classList.add('btn-primary');
  } else {
    bookmarkBtn.innerHTML = '<i class="far fa-bookmark"></i> Save';
    bookmarkBtn.classList.remove('btn-primary');
    bookmarkBtn.classList.add('btn-outline-primary');
  }
}

/**
 * Load related articles
 */
async function loadRelatedArticles() {
  if (!currentArticle || !relatedArticlesContainer) return;
  
  try {
    // Fetch articles in the same category
    const result = await articleService.getArticles({
      category: currentArticle.category,
      limit: 5,
      sort: 'newest'
    });
    
    // Filter out the current article
    const relatedArticles = result.articles.filter(article => 
      article.article_id !== currentArticle.article_id
    ).slice(0, 3);
    
    // Clear container
    relatedArticlesContainer.innerHTML = '';
    
    if (relatedArticles.length === 0) {
      relatedArticlesContainer.innerHTML = '<p class="text-muted">No related articles found.</p>';
      return;
    }
    
    // Create related article items
    relatedArticles.forEach(article => {
      const articleElement = document.createElement('div');
      articleElement.className = 'related-article';
      
      const scoreInfo = articleService.getScoreInfo(article.fact_check_score);
      
      articleElement.innerHTML = `
        <div class="related-article-title">
          <a href="article.html?id=${article.article_id}" class="text-decoration-none">
            ${article.title}
          </a>
        </div>
        <div class="related-article-meta">
          ${article.source} · ${articleService.formatDate(article.published_date, 'short')}
        </div>
        <div class="mt-1">
          <span class="badge ${scoreInfo.class}">
            ${article.fact_check_score}% ${scoreInfo.label}
          </span>
        </div>
      `;
      
      relatedArticlesContainer.appendChild(articleElement);
    });
    
  } catch (error) {
    console.error('Error loading related articles:', error);
    relatedArticlesContainer.innerHTML = '<p class="text-muted">Error loading related articles.</p>';
  }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
  if (articleLoading) articleLoading.style.display = 'none';
  if (articleContent) articleContent.style.display = 'none';
  if (articleError) articleError.style.display = 'block';
  if (errorMessage) errorMessage.textContent = message;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);