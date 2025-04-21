/**
 * Article Service for FactNet
 * Handles article data fetching and manipulation
 */

class ArticleService {
    /**
     * Fetch articles with optional filtering and pagination
     * @param {Object} options - Query options for filtering articles
     * @returns {Promise} Promise that resolves with articles data
     */
    async getArticles(options = {}) {
      try {
        // Build query string from options
        const queryParams = new URLSearchParams();
        
        if (options.page) {
          queryParams.append('page', options.page);
        }
        
        if (options.limit) {
          queryParams.append('limit', options.limit);
        }
        
        if (options.category && options.category !== 'all') {
          queryParams.append('category', options.category);
        }
        
        if (options.search) {
          queryParams.append('search', options.search);
        }
        
        if (options.sort) {
          queryParams.append('sort', options.sort);
        }
        
        if (options.from) {
          queryParams.append('from', options.from);
        }
        
        if (options.to) {
          queryParams.append('to', options.to);
        }
        
        if (options.verified) {
          queryParams.append('verified', options.verified);
        }
        
        if (options.source) {
          queryParams.append('source', options.source);
        }
        
        // Make API request
        const url = `${API_BASE_URL}/articles?${queryParams.toString()}`;
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching articles:', error);
        throw error;
      }
    }
  
    /**
     * Fetch a single article by ID
     * @param {string} articleId - The article ID
     * @returns {Promise} Promise that resolves with the article data
     */
    async getArticleById(articleId) {
      try {
        const response = await fetch(`${API_BASE_URL}/articles/${articleId}`, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Error fetching article ${articleId}:`, error);
        throw error;
      }
    }
  
    /**
     * Submit an article for fact-checking
     * @param {Object} articleData - Article data to submit
     * @returns {Promise} Promise that resolves with submission result
     */
    async submitArticle(articleData) {
      try {
        const response = await fetch(`${API_BASE_URL}/articles/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(articleData),
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error submitting article:', error);
        throw error;
      }
    }
  
    /**
     * Submit feedback (upvote/downvote) for an article
     * @param {string} articleId - The article ID
     * @param {string} vote - The vote type ('upvote' or 'downvote')
     * @returns {Promise} Promise that resolves with feedback submission result
     */
    async submitFeedback(articleId, vote) {
      try {
        const response = await fetch(`${API_BASE_URL}/articles/${articleId}/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ vote }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error submitting feedback:', error);
        throw error;
      }
    }
  
    /**
     * Format a date for display
     * @param {string|Date} dateString - Date to format
     * @param {string} format - Format type ('full', 'medium', or 'short')
     * @returns {string} Formatted date string
     */
    formatDate(dateString, format = 'medium') {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, DATE_FORMAT_OPTIONS[format]);
      } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
      }
    }
  
    /**
     * Get the appropriate class and label for a fact-check score
     * @param {number} score - The fact-check score (0-100)
     * @returns {Object} Object with class and label properties
     */
    getScoreInfo(score) {
      if (score >= SCORE_RANGES.HIGH.min) {
        return {
          class: SCORE_RANGES.HIGH.class,
          label: SCORE_RANGES.HIGH.label
        };
      } else if (score >= SCORE_RANGES.MEDIUM.min) {
        return {
          class: SCORE_RANGES.MEDIUM.class,
          label: SCORE_RANGES.MEDIUM.label
        };
      } else {
        return {
          class: SCORE_RANGES.LOW.class,
          label: SCORE_RANGES.LOW.label
        };
      }
    }
  
    /**
     * Create pagination links
     * @param {number} currentPage - Current page number
     * @param {number} totalPages - Total number of pages
     * @param {Function} onPageClick - Function to call when a page is clicked
     * @returns {DocumentFragment} Fragment containing pagination elements
     */
    createPagination(currentPage, totalPages, onPageClick) {
      const fragment = document.createDocumentFragment();
      const maxButtons = PAGINATION.MAX_PAGE_BUTTONS;
      
      // Previous button
      const prevLi = document.createElement('li');
      prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
      
      const prevLink = document.createElement('a');
      prevLink.className = 'page-link';
      prevLink.href = '#';
      prevLink.setAttribute('aria-label', 'Previous');
      prevLink.innerHTML = '<span aria-hidden="true">&laquo;</span>';
      
      if (currentPage > 1) {
        prevLink.addEventListener('click', (e) => {
          e.preventDefault();
          onPageClick(currentPage - 1);
        });
      }
      
      prevLi.appendChild(prevLink);
      fragment.appendChild(prevLi);
      
      // Determine which page buttons to show
      let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
      let endPage = Math.min(totalPages, startPage + maxButtons - 1);
      
      if (endPage - startPage + 1 < maxButtons) {
        startPage = Math.max(1, endPage - maxButtons + 1);
      }
      
      // Page buttons
      for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        
        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = '#';
        pageLink.textContent = i;
        
        if (i !== currentPage) {
          pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            onPageClick(i);
          });
        }
        
        pageLi.appendChild(pageLink);
        fragment.appendChild(pageLi);
      }
      
      // Next button
      const nextLi = document.createElement('li');
      nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
      
      const nextLink = document.createElement('a');
      nextLink.className = 'page-link';
      nextLink.href = '#';
      nextLink.setAttribute('aria-label', 'Next');
      nextLink.innerHTML = '<span aria-hidden="true">&raquo;</span>';
      
      if (currentPage < totalPages) {
        nextLink.addEventListener('click', (e) => {
          e.preventDefault();
          onPageClick(currentPage + 1);
        });
      }
      
      nextLi.appendChild(nextLink);
      fragment.appendChild(nextLi);
      
      return fragment;
    }
  
    /**
     * Create an article card element
     * @param {Object} article - Article data
     * @returns {HTMLElement} Article card element
     */
    createArticleCard(article) {
      const scoreInfo = this.getScoreInfo(article.fact_check_score);
      
      const card = document.createElement('div');
      card.className = 'col-md-6 col-lg-4 mb-4';
      
      card.innerHTML = `
        <div class="card article-card shadow-sm">
          <div class="card-body">
            <span class="badge bg-secondary article-category">${article.category}</span>
            <h5 class="card-title">
              <a href="article.html?id=${article.article_id}" class="text-decoration-none text-dark">
                ${article.title}
              </a>
            </h5>
            <p class="card-text">${article.description.substring(0, 100)}${article.description.length > 100 ? '...' : ''}</p>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="article-source">${article.source}</span>
              <span class="article-date">${this.formatDate(article.published_date, 'short')}</span>
            </div>
            <div class="progress mb-2" style="height: 5px;">
              <div class="progress-bar ${scoreInfo.class}" role="progressbar" 
                style="width: ${article.fact_check_score}%;" 
                aria-valuenow="${article.fact_check_score}" aria-valuemin="0" aria-valuemax="100">
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <span class="badge ${scoreInfo.class} fact-check-badge">
                ${article.fact_check_score}% ${scoreInfo.label}
              </span>
              <small class="text-muted">
                <i class="fas fa-thumbs-up me-1"></i>${article.upvotes}
                <i class="fas fa-thumbs-down ms-2 me-1"></i>${article.downvotes}
              </small>
            </div>
          </div>
          <div class="card-footer">
            <div class="d-grid">
              <a href="article.html?id=${article.article_id}" class="btn btn-sm btn-outline-primary">Read Details</a>
            </div>
          </div>
        </div>
      `;
      
      return card;
    }
  }
  
  // Create a singleton instance
  const articleService = new ArticleService();