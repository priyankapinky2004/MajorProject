/**
 * Main JavaScript for FactNet homepage
 * Handles article listing and filtering
 */

// Current filter state
const filterState = {
    page: 1,
    limit: PAGINATION.DEFAULT_PAGE_SIZE,
    category: 'all',
    sort: 'newest',
    search: '',
    date: ''
  };
  
  // DOM elements
  const articlesContainer = document.getElementById('articles-container');
  const paginationContainer = document.getElementById('pagination');
  const articleCountElement = document.getElementById('article-count');
  const categoryButtons = document.querySelectorAll('.category-btn');
  const sortButtons = document.querySelectorAll('.sort-btn');
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const dateFilter = document.getElementById('date-filter');
  const clearDateBtn = document.getElementById('clear-date-btn');
  
  /**
   * Initialize the page
   */
  async function init() {
    // Load initial articles
    await loadArticles();
    
    // Set up event listeners
    setupEventListeners();
  }
  
  /**
   * Load articles based on current filter state
   */
  async function loadArticles() {
    try {
      // Show loading state
      articlesContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading articles...</p>
        </div>
      `;
      
      // Prepare query options
      const options = {
        page: filterState.page,
        limit: filterState.limit
      };
      
      if (filterState.category !== 'all') {
        options.category = filterState.category;
      }
      
      if (filterState.sort) {
        options.sort = filterState.sort;
      }
      
      if (filterState.search) {
        options.search = filterState.search;
      }
      
      if (filterState.date) {
        options.from = filterState.date;
      }
      
      // Fetch articles
      const result = await articleService.getArticles(options);
      
      // Clear container
      articlesContainer.innerHTML = '';
      
      // Update article count
      if (articleCountElement) {
        articleCountElement.textContent = `Showing ${result.articles.length} of ${result.totalArticles} articles`;
      }
      
      // Display articles
      if (result.articles.length === 0) {
        articlesContainer.innerHTML = `
          <div class="col-12 text-center py-5">
            <i class="fas fa-search fa-3x mb-3 text-muted"></i>
            <h4>No articles found</h4>
            <p class="text-muted">Try adjusting your search or filter criteria</p>
            <button id="reset-filters-btn" class="btn btn-outline-primary">Reset Filters</button>
          </div>
        `;
        
        // Add event listener to reset button
        const resetBtn = document.getElementById('reset-filters-btn');
        if (resetBtn) {
          resetBtn.addEventListener('click', resetFilters);
        }
      } else {
        // Create article cards
        result.articles.forEach(article => {
          const card = articleService.createArticleCard(article);
          articlesContainer.appendChild(card);
        });
      }
      
      // Update pagination
      updatePagination(result.currentPage, result.totalPages);
      
    } catch (error) {
      console.error('Error loading articles:', error);
      articlesContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="fas fa-exclamation-triangle fa-3x mb-3 text-danger"></i>
          <h4>Error Loading Articles</h4>
          <p class="text-muted">There was a problem loading the articles. Please try again later.</p>
          <button id="retry-btn" class="btn btn-primary">Retry</button>
        </div>
      `;
      
      // Add event listener to retry button
      const retryBtn = document.getElementById('retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', loadArticles);
      }
    }
  }
  
  /**
   * Update pagination controls
   * @param {number} currentPage - Current page number
   * @param {number} totalPages - Total number of pages
   */
  function updatePagination(currentPage, totalPages) {
    if (!paginationContainer) return;
    
    // Clear pagination container
    paginationContainer.innerHTML = '';
    
    // If there's only one page, don't show pagination
    if (totalPages <= 1) return;
    
    const paginationFragment = articleService.createPagination(currentPage, totalPages, (page) => {
      filterState.page = page;
      loadArticles();
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    paginationContainer.appendChild(paginationFragment);
  }
  
  /**
   * Set up event listeners for filters and search
   */
  function setupEventListeners() {
    // Category filters
    if (categoryButtons) {
      categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
          // Update active state
          categoryButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          
          // Update filter state
          filterState.category = button.dataset.category;
          filterState.page = 1; // Reset to first page
          
          // Load articles with new filter
          loadArticles();
        });
      });
    }
    
    // Sort options
    if (sortButtons) {
      sortButtons.forEach(button => {
        button.addEventListener('click', () => {
          // Update active state
          sortButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          
          // Update filter state
          filterState.sort = button.dataset.sort;
          
          // Load articles with new sort
          loadArticles();
        });
      });
    }
    
    // Search form
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Update filter state
        filterState.search = searchInput.value.trim();
        filterState.page = 1; // Reset to first page
        
        // Load articles with search
        loadArticles();
      });
    }
    
    // Date filter
    if (dateFilter) {
      dateFilter.addEventListener('change', () => {
        // Update filter state
        filterState.date = dateFilter.value;
        filterState.page = 1; // Reset to first page
        
        // Load articles with date filter
        loadArticles();
      });
    }
    
    // Clear date button
    if (clearDateBtn) {
      clearDateBtn.addEventListener('click', () => {
        dateFilter.value = '';
        filterState.date = '';
        loadArticles();
      });
    }
  }
  
  /**
   * Reset all filters to default values
   */
  function resetFilters() {
    // Reset filter state
    filterState.page = 1;
    filterState.category = 'all';
    filterState.sort = 'newest';
    filterState.search = '';
    filterState.date = '';
    
    // Reset UI elements
    categoryButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.category === 'all') {
        btn.classList.add('active');
      }
    });
    
    sortButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.sort === 'newest') {
        btn.classList.add('active');
      }
    });
    
    if (searchInput) searchInput.value = '';
    if (dateFilter) dateFilter.value = '';
    
    // Load articles with reset filters
    loadArticles();
  }
  
  // Initialize on page load
  document.addEventListener('DOMContentLoaded', init);