/**
 * JavaScript for Submit Article Page
 * Handles article submission form and validation
 */

// DOM elements
const loginRequiredMessage = document.getElementById('login-required-message');
const submitArticleForm = document.getElementById('submit-article-form');
const submitSuccess = document.getElementById('submit-success');
const submitError = document.getElementById('submit-error');
const errorMessageElement = document.getElementById('error-message');
const articleLink = document.getElementById('article-link');
const submitBtn = document.getElementById('submit-btn');

// Form inputs
const articleUrlInput = document.getElementById('article-url');
const articleTitleInput = document.getElementById('article-title');
const articleDescriptionInput = document.getElementById('article-description');
const articleSourceInput = document.getElementById('article-source');

/**
 * Initialize the page
 */
function init() {
  // Check authentication status
  checkAuthStatus();
  
  // Set up form submission handler
  if (submitArticleForm) {
    submitArticleForm.addEventListener('submit', handleSubmit);
  }
}

/**
 * Check if user is authenticated
 */
function checkAuthStatus() {
  const isAuthenticated = authService.isAuthenticated;
  
  if (isAuthenticated) {
    // Show submission form
    if (loginRequiredMessage) loginRequiredMessage.style.display = 'none';
    if (submitArticleForm) submitArticleForm.style.display = 'block';
  } else {
    // Show login required message
    if (loginRequiredMessage) loginRequiredMessage.style.display = 'block';
    if (submitArticleForm) submitArticleForm.style.display = 'none';
    
    // Add auth listener to update UI if user logs in
    authService.addAuthListener((isAuthenticated) => {
      if (isAuthenticated) {
        if (loginRequiredMessage) loginRequiredMessage.style.display = 'none';
        if (submitArticleForm) submitArticleForm.style.display = 'block';
      }
    });
  }
}

/**
 * Handle form submission
 * @param {Event} e - Submit event
 */
async function handleSubmit(e) {
  e.preventDefault();
  
  // Validate form
  if (!validateForm()) {
    return;
  }
  
  // Disable submit button
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';
  }
  
  // Hide previous messages
  if (submitSuccess) submitSuccess.style.display = 'none';
  if (submitError) submitError.style.display = 'none';
  
  try {
    // Prepare article data
    const articleData = {
      url: articleUrlInput.value.trim(),
      title: articleTitleInput.value.trim(),
      description: articleDescriptionInput.value.trim(),
      source: articleSourceInput.value.trim()
    };
    
    // Submit article
    const result = await articleService.submitArticle(articleData);
    
    // Show success message
    if (submitSuccess) {
      submitSuccess.style.display = 'block';
      
      // Set article link
      if (articleLink && result.article_id) {
        articleLink.href = `article.html?id=${result.article_id}`;
      }
      
      // Reset form
      submitArticleForm.reset();
    }
    
  } catch (error) {
    console.error('Error submitting article:', error);
    
    // Show error message
    if (submitError) {
      submitError.style.display = 'block';
      
      if (errorMessageElement) {
        if (error.response && error.response.data && error.response.data.message) {
          errorMessageElement.textContent = error.response.data.message;
        } else {
          errorMessageElement.textContent = 'There was an error submitting your article. Please try again.';
        }
      }
    }
  } finally {
    // Re-enable submit button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Submit for Fact-Checking';
    }
  }
}

/**
 * Validate form inputs
 * @returns {boolean} True if form is valid
 */
function validateForm() {
  let isValid = true;
  
  // Validate URL
  if (!articleUrlInput.value.trim()) {
    articleUrlInput.classList.add('is-invalid');
    isValid = false;
  } else if (!isValidUrl(articleUrlInput.value.trim())) {
    articleUrlInput.classList.add('is-invalid');
    
    // Add error message
    let errorDiv = articleUrlInput.parentElement.querySelector('.invalid-feedback');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'invalid-feedback';
      articleUrlInput.parentElement.appendChild(errorDiv);
    }
    errorDiv.textContent = 'Please enter a valid URL (starting with http:// or https://)';
    
    isValid = false;
  } else {
    articleUrlInput.classList.remove('is-invalid');
  }
  
  // Validate title
  if (!articleTitleInput.value.trim()) {
    articleTitleInput.classList.add('is-invalid');
    isValid = false;
  } else {
    articleTitleInput.classList.remove('is-invalid');
  }
  
  return isValid;
}

/**
 * Check if a string is a valid URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);