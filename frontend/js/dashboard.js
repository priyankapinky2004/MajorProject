/**
 * JavaScript for Dashboard Page
 * Handles dashboard functionality and admin features
 */

// Current dashboard state
const dashboardState = {
    currentSection: 'dashboard-overview',
    articlesList: {
      page: 1,
      limit: 10,
      category: '',
      search: '',
      date: ''
    }
  };
  
  // DOM elements - Sidebar links
  const dashboardOverviewLink = document.getElementById('dashboard-overview-link');
  const articlesListLink = document.getElementById('articles-list-link');
  const submittedArticlesLink = document.getElementById('submitted-articles-link');
  const validationQueueLink = document.getElementById('validation-queue-link');
  const settingsLink = document.getElementById('settings-link');
  const manageUsersLink = document.getElementById('manage-users-link');
  const systemLogsLink = document.getElementById('system-logs-link');
  
  // DOM elements - Dashboard sections
  const dashboardOverview = document.getElementById('dashboard-overview');
  const articlesList = document.getElementById('articles-list');
  
  // DOM elements - Dashboard title
  const dashboardTitle = document.getElementById('dashboard-title');
  
  // DOM elements - Dashboard stats
  const totalArticlesElement = document.getElementById('total-articles');
  const verifiedArticlesElement = document.getElementById('verified-articles');
  const avgFactScoreElement = document.getElementById('avg-fact-score');
  const pendingValidationElement = document.getElementById('pending-validation');
  
  // DOM elements - Recent articles table
  const recentArticlesTbody = document.getElementById('recent-articles-tbody');
  
  // DOM elements - All articles table
  const allArticlesTbody = document.getElementById('all-articles-tbody');
  const articlesPagination = document.getElementById('articles-pagination');
  const articlesSearch = document.getElementById('articles-search');
  const articlesSearchBtn = document.getElementById('articles-search-btn');
  const articlesCategoryFilter = document.getElementById('articles-category-filter');
  const articlesDateFilter = document.getElementById('articles-date-filter');
  const articlesDateClear = document.getElementById('articles-date-clear');
  
  // DOM elements - Delete modal
  const deleteArticleModal = document.getElementById('deleteArticleModal');
  const deleteArticleTitle = document.getElementById('delete-article-title');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  
  // Current article to delete
  let articleToDelete = null;
  
  /**
   * Initialize the dashboard
   */
  async function init() {
    // Check if user is authenticated
    if (!authService.isAuthenticated) {
      window.location.href = 'index.html';
      return;
    }
    
    // Check if user is admin
    const isAdmin = authService.isAdmin();
    const adminFunctions = document.getElementById('admin-functions');
    
    if (isAdmin && adminFunctions) {
      adminFunctions.style.display = 'block';
    }
    
    // Set up navigation links
    setupNavigation();
    
    // Load initial dashboard data
    await loadDashboardOverview();
    
    // Set up event listeners for filters and actions
    setupEventListeners();
    
    // Show the current section
    showSection(dashboardState.currentSection);
  }
  
  /**
   * Set up navigation links
   */
  function setupNavigation() {
    // Dashboard overview
    if (dashboardOverviewLink) {
      dashboardOverviewLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection('dashboard-overview');
        loadDashboardOverview();
      });
    }
    
    // Articles list
    if (articlesListLink) {
      articlesListLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection('articles-list');
        loadArticlesList();
      });
    }
    
    // Submitted articles (placeholder)
    if (submittedArticlesLink) {
      submittedArticlesLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert('This feature is not implemented in the MVP version.');
      });
    }
    
    // Validation queue (placeholder)
    if (validationQueueLink) {
      validationQueueLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert('This feature is not implemented in the MVP version.');
      });
    }
    
    // Settings (placeholder)
    if (settingsLink) {
      settingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert('This feature is not implemented in the MVP version.');
      });
    }
    
    // Manage users (placeholder)
    if (manageUsersLink) {
      manageUsersLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert('This feature is not implemented in the MVP version.');
      });
    }
    
    // System logs (placeholder)
    if (systemLogsLink) {
      systemLogsLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert('This feature is not implemented in the MVP version.');
      });
    }
    
    // Update active link
    updateActiveNavLink();
  }
  
  /**
   * Show the specified section and hide others
   * @param {string} sectionId - ID of the section to show
   */
  function showSection(sectionId) {
    // Update current section
    dashboardState.currentSection = sectionId;
    
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => {
      section.style.display = 'none';
    });
    
    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
      selectedSection.style.display = 'block';
    }
    
    // Update dashboard title
    updateDashboardTitle();
    
    // Update active navigation link
    updateActiveNavLink();
  }
  
  /**
   * Update the dashboard title based on current section
   */
  function updateDashboardTitle() {
    if (!dashboardTitle) return;
    
    switch (dashboardState.currentSection) {
      case 'dashboard-overview':
        dashboardTitle.textContent = 'Dashboard Overview';
        break;
      case 'articles-list':
        dashboardTitle.textContent = 'All Articles';
        break;
      default:
        dashboardTitle.textContent = 'Dashboard';
    }
  }
  
  /**
   * Update active navigation link based on current section
   */
  function updateActiveNavLink() {
    // Remove active class from all links
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
    });
    
    // Add active class to current section link
    let activeLink;
    
    switch (dashboardState.currentSection) {
      case 'dashboard-overview':
        activeLink = dashboardOverviewLink;
        break;
      case 'articles-list':
        activeLink = articlesListLink;
        break;
      // Add more cases as needed
    }
    
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }
  
  /**
   * Load dashboard overview data
   */
  async function loadDashboardOverview() {
    try {
      // Fetch dashboard stats
      await Promise.all([
        loadDashboardStats(),
        loadRecentArticles()
      ]);
      
    } catch (error) {
      console.error('Error loading dashboard overview:', error);
      // Show error message
    }
  }
  
  /**
   * Load dashboard statistics
   */
  async function loadDashboardStats() {
    try {
      // For the MVP, we'll just fetch article counts
      const articlesResult = await articleService.getArticles({
        limit: 1
      });
      
      // Update total articles count
      if (totalArticlesElement) {
        totalArticlesElement.textContent = articlesResult.totalArticles || 0;
      }
      
      // For verified articles, use a filter
      const verifiedResult = await articleService.getArticles({
        limit: 1,
        verified: true
      });
      
      if (verifiedArticlesElement) {
        verifiedArticlesElement.textContent = verifiedResult.totalArticles || 0;
      }
      
      // Calculate average fact check score (mock for MVP)
      if (avgFactScoreElement) {
        // In a real application, this would be calculated on the server
        avgFactScoreElement.textContent = '73%';
      }
      
      // Pending validation count (mock for MVP)
      if (pendingValidationElement) {
        pendingValidationElement.textContent = '12';
      }
      
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Show error message
    }
  }
  
  /**
   * Load recent articles for overview
   */
  async function loadRecentArticles() {
    if (!recentArticlesTbody) return;
    
    try {
      // Show loading state
      recentArticlesTbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <span class="ms-2">Loading articles...</span>
          </td>
        </tr>
      `;
      
      // Fetch recent articles
      const result = await articleService.getArticles({
        limit: 5,
        sort: 'newest'
      });
      
      // Clear table
      recentArticlesTbody.innerHTML = '';
      
      // Check if there are articles
      if (result.articles.length === 0) {
        recentArticlesTbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center">No articles found</td>
          </tr>
        `;
        return;
      }
      
      // Add articles to table
      result.articles.forEach(article => {
        const scoreInfo = articleService.getScoreInfo(article.fact_check_score);
        
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>
            <a href="article.html?id=${article.article_id}" class="article-title-link" target="_blank">
              ${article.title.length > 50 ? article.title.substring(0, 50) + '...' : article.title}
            </a>
          </td>
          <td>${article.source}</td>
          <td>${article.category}</td>
          <td>${articleService.formatDate(article.published_date, 'short')}</td>
          <td>
            <span class="badge ${scoreInfo.class}">${article.fact_check_score}%</span>
          </td>
          <td class="action-buttons">
            <a href="article.html?id=${article.article_id}" class="btn btn-sm btn-outline-primary" target="_blank">
              <i class="fas fa-eye"></i>
            </a>
            <button class="btn btn-sm btn-outline-danger delete-article-btn" data-article-id="${article.article_id}" data-article-title="${article.title}">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;
        
        recentArticlesTbody.appendChild(row);
      });
      
      // Add event listeners to delete buttons
      const deleteButtons = recentArticlesTbody.querySelectorAll('.delete-article-btn');
      deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
          showDeleteModal(button.dataset.articleId, button.dataset.articleTitle);
        });
      });
      
    } catch (error) {
      console.error('Error loading recent articles:', error);
      recentArticlesTbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Error loading articles
          </td>
        </tr>
      `;
    }
  }
  
  /**
   * Load all articles for the articles list section
   */
  async function loadArticlesList() {
    if (!allArticlesTbody) return;
    
    try {
      // Show loading state
      allArticlesTbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <span class="ms-2">Loading articles...</span>
          </td>
        </tr>
      `;
      
      // Prepare query options
      const options = {
        page: dashboardState.articlesList.page,
        limit: dashboardState.articlesList.limit
      };
      
      if (dashboardState.articlesList.category) {
        options.category = dashboardState.articlesList.category;
      }
      
      if (dashboardState.articlesList.search) {
        options.search = dashboardState.articlesList.search;
      }
      
      if (dashboardState.articlesList.date) {
        options.from = dashboardState.articlesList.date;
      }
      
      // Fetch articles
      const result = await articleService.getArticles(options);
      
      // Clear table
      allArticlesTbody.innerHTML = '';
      
      // Check if there are articles
      if (result.articles.length === 0) {
        allArticlesTbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center">No articles found</td>
          </tr>
        `;
        
        // Clear pagination
        if (articlesPagination) {
          articlesPagination.innerHTML = '';
        }
        
        return;
      }
      
      // Add articles to table
      result.articles.forEach(article => {
        const scoreInfo = articleService.getScoreInfo(article.fact_check_score);
        
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>
            <a href="article.html?id=${article.article_id}" class="article-title-link" target="_blank">
              ${article.title.length > 50 ? article.title.substring(0, 50) + '...' : article.title}
            </a>
          </td>
          <td>${article.source}</td>
          <td>${article.category}</td>
          <td>${articleService.formatDate(article.published_date, 'short')}</td>
          <td>
            <span class="badge ${scoreInfo.class}">${article.fact_check_score}%</span>
          </td>
          <td class="action-buttons">
            <a href="article.html?id=${article.article_id}" class="btn btn-sm btn-outline-primary" target="_blank">
              <i class="fas fa-eye"></i>
            </a>
            <button class="btn btn-sm btn-outline-danger delete-article-btn" data-article-id="${article.article_id}" data-article-title="${article.title}">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;
        
        allArticlesTbody.appendChild(row);
      });
      
      // Add event listeners to delete buttons
      const deleteButtons = allArticlesTbody.querySelectorAll('.delete-article-btn');
      deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
          showDeleteModal(button.dataset.articleId, button.dataset.articleTitle);
        });
      });
      
      // Update pagination
      updateArticlesPagination(result.currentPage, result.totalPages);
      
    } catch (error) {
      console.error('Error loading articles list:', error);
      allArticlesTbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Error loading articles
          </td>
        </tr>
      `;
    }
  }
  
  /**
   * Update articles pagination
   * @param {number} currentPage - Current page number
   * @param {number} totalPages - Total number of pages
   */
  function updateArticlesPagination(currentPage, totalPages) {
    if (!articlesPagination) return;
    
    // Clear pagination container
    articlesPagination.innerHTML = '';
    
    // If there's only one page, don't show pagination
    if (totalPages <= 1) return;
    
    const paginationFragment = articleService.createPagination(currentPage, totalPages, (page) => {
      dashboardState.articlesList.page = page;
      loadArticlesList();
      // Scroll to top of table
      articlesList.scrollIntoView({ behavior: 'smooth' });
    });
    
    articlesPagination.appendChild(paginationFragment);
  }
  
  /**
   * Set up event listeners for dashboard actions
   */
  function setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        if (dashboardState.currentSection === 'dashboard-overview') {
          loadDashboardOverview();
        } else if (dashboardState.currentSection === 'articles-list') {
          loadArticlesList();
        }
      });
    }
    
    // Export button (placeholder)
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        alert('Export functionality is not implemented in the MVP version.');
      });
    }
    
    // Articles search
    if (articlesSearchBtn && articlesSearch) {
      articlesSearchBtn.addEventListener('click', () => {
        dashboardState.articlesList.search = articlesSearch.value.trim();
        dashboardState.articlesList.page = 1; // Reset to first page
        loadArticlesList();
      });
      
      // Also trigger search on Enter key
      articlesSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          dashboardState.articlesList.search = articlesSearch.value.trim();
          dashboardState.articlesList.page = 1; // Reset to first page
          loadArticlesList();
        }
      });
    }
    
    // Articles category filter
    if (articlesCategoryFilter) {
      articlesCategoryFilter.addEventListener('change', () => {
        dashboardState.articlesList.category = articlesCategoryFilter.value;
        dashboardState.articlesList.page = 1; // Reset to first page
        loadArticlesList();
      });
    }
    
    // Articles date filter
    if (articlesDateFilter) {
      articlesDateFilter.addEventListener('change', () => {
        dashboardState.articlesList.date = articlesDateFilter.value;
        dashboardState.articlesList.page = 1; // Reset to first page
        loadArticlesList();
      });
    }
    
    // Clear date filter
    if (articlesDateClear) {
      articlesDateClear.addEventListener('click', () => {
        articlesDateFilter.value = '';
        dashboardState.articlesList.date = '';
        loadArticlesList();
      });
    }
    
    // Delete article confirmation
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', deleteArticle);
    }
  }
  
  /**
   * Show delete confirmation modal
   * @param {string} articleId - ID of article to delete
   * @param {string} articleTitle - Title of article to delete
   */
  function showDeleteModal(articleId, articleTitle) {
    // Set article to delete
    articleToDelete = articleId;
    
    // Update modal content
    if (deleteArticleTitle) {
      deleteArticleTitle.textContent = articleTitle;
    }
    
    // Show modal
    const modal = new bootstrap.Modal(deleteArticleModal);
    modal.show();
  }
  
  /**
   * Delete an article
   */
  async function deleteArticle() {
    if (!articleToDelete) return;
    
    try {
      // In a real application, this would make an API call
      // For the MVP, we'll just show a success message
      alert(`Article would be deleted (ID: ${articleToDelete}). This is a placeholder for the MVP.`);
      
      // Hide modal
      const modal = bootstrap.Modal.getInstance(deleteArticleModal);
      if (modal) {
        modal.hide();
      }
      
      // Reload data
      if (dashboardState.currentSection === 'dashboard-overview') {
        loadDashboardOverview();
      } else if (dashboardState.currentSection === 'articles-list') {
        loadArticlesList();
      }
      
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Error deleting article. Please try again.');
    } finally {
      // Reset article to delete
      articleToDelete = null;
    }
  }
  
  // Initialize on page load
  document.addEventListener('DOMContentLoaded', init);