/**
 * Authentication Service for FactNet
 * Handles user authentication and session management
 */

class AuthService {
    constructor() {
      this.currentUser = null;
      this.isAuthenticated = false;
      this.authListeners = [];
      
      // Check authentication status on load
      this.checkAuthStatus();
    }
  
    /**
     * Check if the user is authenticated
     * @returns {Promise} Promise that resolves with auth status
     */
    async checkAuthStatus() {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/status`, {
          method: 'GET',
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.isAuthenticated) {
          this.isAuthenticated = true;
          this.currentUser = data.user;
        } else {
          this.isAuthenticated = false;
          this.currentUser = null;
        }
        
        // Notify listeners about authentication state change
        this.notifyListeners();
        
        return this.isAuthenticated;
      } catch (error) {
        console.error('Error checking authentication status:', error);
        this.isAuthenticated = false;
        this.currentUser = null;
        this.notifyListeners();
        return false;
      }
    }
  
    /**
     * Logout the current user
     * @returns {Promise} Promise that resolves after logout
     */
    async logout() {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'GET',
          credentials: 'include'
        });
        
        this.isAuthenticated = false;
        this.currentUser = null;
        
        // Notify listeners about authentication state change
        this.notifyListeners();
        
        return true;
      } catch (error) {
        console.error('Error during logout:', error);
        return false;
      }
    }
  
    /**
     * Get the current authenticated user
     * @returns {Object|null} Current user or null if not authenticated
     */
    getUser() {
      return this.currentUser;
    }
  
    /**
     * Check if the current user is an admin
     * @returns {boolean} True if user is an admin
     */
    isAdmin() {
      return this.isAuthenticated && this.currentUser && this.currentUser.role === 'admin';
    }
  
    /**
     * Add a listener for authentication state changes
     * @param {Function} listener Callback function to be called on auth state change
     */
    addAuthListener(listener) {
      if (typeof listener === 'function' && !this.authListeners.includes(listener)) {
        this.authListeners.push(listener);
        
        // Call the listener immediately with current state
        listener(this.isAuthenticated, this.currentUser);
      }
    }
  
    /**
     * Remove a listener for authentication state changes
     * @param {Function} listener Callback function to remove
     */
    removeAuthListener(listener) {
      const index = this.authListeners.indexOf(listener);
      if (index !== -1) {
        this.authListeners.splice(index, 1);
      }
    }
  
    /**
     * Notify all listeners about authentication state change
     */
    notifyListeners() {
      this.authListeners.forEach(listener => {
        listener(this.isAuthenticated, this.currentUser);
      });
    }
  
    /**
     * Update the UI based on authentication status
     */
    updateUI() {
      const authButtons = document.getElementById('auth-buttons');
      const userProfile = document.getElementById('user-profile');
      const dashboardLink = document.getElementById('dashboard-link');
      
      if (this.isAuthenticated && this.currentUser) {
        // Hide login button
        if (authButtons) {
          authButtons.style.display = 'none';
        }
        
        // Show user profile
        if (userProfile) {
          userProfile.style.display = 'block';
          
          const userAvatar = document.getElementById('user-avatar');
          const userName = document.getElementById('user-name');
          
          if (userAvatar) {
            userAvatar.src = this.currentUser.profileImage || 'img/default-avatar.png';
          }
          
          if (userName) {
            userName.textContent = this.currentUser.displayName;
          }
        }
        
        // Show dashboard link (for all users in this MVP)
        if (dashboardLink) {
          dashboardLink.style.display = 'block';
        }
        
        // Add logout event listener
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await this.logout();
            window.location.href = 'index.html';
          });
        }
        
      } else {
        // Show login button
        if (authButtons) {
          authButtons.style.display = 'block';
        }
        
        // Hide user profile
        if (userProfile) {
          userProfile.style.display = 'none';
        }
        
        // Hide dashboard link
        if (dashboardLink) {
          dashboardLink.style.display = 'none';
        }
      }
    }
  }
  
  // Create a singleton instance
  const authService = new AuthService();
  
  // Update UI on page load
  document.addEventListener('DOMContentLoaded', () => {
    authService.addAuthListener(() => {
      authService.updateUI();
    });
  });