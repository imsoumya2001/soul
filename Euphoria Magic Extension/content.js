// Content script for Soul AI Scene Transformation
class SoulAIContentScript {
  constructor() {
    this.icons = new Map(); // Store icon elements for each image
    this.isEnabled = true;
    
    this.init();
  }

  init() {
    this.addIconsToImages();
    this.observeNewImages();
    this.loadSettings();
  }

  addIconsToImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => this.addIconToImage(img));
  }

  addIconToImage(img) {
    // Skip if image is too small or already has an icon
    if (!this.isValidImage(img) || this.icons.has(img)) {
      return;
    }

    // Create icon element
    const icon = document.createElement('div');
    icon.className = 'soul-ai-icon';
    icon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
      </svg>
    `;

    // Position icon relative to image
    this.positionIcon(icon, img);
    
    // Add click handler
     icon.addEventListener('click', (e) => {
       e.preventDefault();
       e.stopPropagation();
       this.handleImageClick(img);
     });

    // Add to DOM and store reference
    document.body.appendChild(icon);
    this.icons.set(img, icon);

    // Update position on scroll and resize
    const updatePosition = () => this.positionIcon(icon, img);
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition, { passive: true });
  }

  positionIcon(icon, img) {
    const rect = img.getBoundingClientRect();
    
    // Position icon at bottom-left corner of image with padding
    icon.style.left = (rect.left + 8) + 'px';
    icon.style.top = (rect.bottom - 40) + 'px';
    
    // Hide icon if image is not visible
    if (rect.width === 0 || rect.height === 0 || 
        rect.bottom < 0 || rect.top > window.innerHeight ||
        rect.right < 0 || rect.left > window.innerWidth) {
      icon.style.display = 'none';
    } else {
      icon.style.display = 'flex';
    }
  }

  observeNewImages() {
    // Watch for new images added to the page
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'IMG') {
              setTimeout(() => this.addIconToImage(node), 100);
            } else {
              const images = node.querySelectorAll && node.querySelectorAll('img');
              if (images) {
                images.forEach(img => {
                  setTimeout(() => this.addIconToImage(img), 100);
                });
              }
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }



  isValidImage(element) {
    if (element.tagName !== 'IMG') return false;
    
    // Debug logging for Pinterest
    if (window.location.hostname.includes('pinterest')) {
      // Pinterest image check - silently handle
    }
    
    // Check image dimensions - adjust for different platforms
    const minSize = window.location.hostname.includes('pinterest') ? 150 : 200;
    if (element.offsetWidth < minSize || element.offsetHeight < minSize) {
      if (window.location.hostname.includes('pinterest')) {
        // Image too small - silently handle
      }
      return false;
    }
    
    // Check if image has valid source
    if (!element.src || element.src.includes('data:image/svg')) return false;
    
    // Exclude common UI elements
    const excludeClasses = ['icon', 'logo', 'avatar', 'profile', 'button', 'thumbnail'];
    const className = element.className.toLowerCase();
    if (excludeClasses.some(cls => className.includes(cls))) return false;
    
    // Exclude images with certain attributes
    if (element.hasAttribute('data-no-soul-ai')) return false;
    
    // Special handling for Pinterest images
    if (window.location.hostname.includes('pinterest')) {
      // Pinterest images can be in various containers, be more flexible
      const isPinImage = element.closest('[data-test-id*="pin"], .pinWrapper, [role="img"], .gridCentered, .mainContainer') ||
                        element.src.includes('pinimg.com') ||
                        element.alt ||
                        element.offsetWidth >= 200;
      if (!isPinImage) return false;
    }
    
    // Valid image detected - silently handle
    
    // Special handling for Instagram images
    if (window.location.hostname.includes('instagram')) {
      // Instagram post images
      const postContainer = element.closest('article, [role="presentation"]');
      if (!postContainer) return false;
    }
    
    // Check if image is likely a scene/photo (not an icon or UI element)
    const aspectRatio = element.offsetWidth / element.offsetHeight;
    if (aspectRatio < 0.3 || aspectRatio > 3) return false; // Exclude very narrow or very wide images
    
    return true;
  }



  async handleImageClick(image) {
    if (!image) return;
    
    const imageUrl = this.getHighResImageUrl(image);
    
    try {
      // Send message to background script to store the selected image
      const response = await chrome.runtime.sendMessage({
        action: 'setReferenceImage',
        imageUrl: imageUrl,
        pageUrl: window.location.href,
        pageTitle: document.title
      });
      
      if (response.success) {
        this.showSuccessMessage('Image added to reference! Opening extension...');
        // Open the actual extension popup
        try {
          await chrome.runtime.sendMessage({ action: 'openActualPopup' });
        } catch (popupError) {
          // Popup opening handled by background script
        }
      } else {
        this.showErrorMessage(response.error || 'Failed to select image');
      }
    } catch (error) {
      // Error selecting reference image - silently handle
      this.showErrorMessage('Failed to select reference image');
    }
  }

  getHighResImageUrl(img) {
    let imageUrl = img.src;
    
    // Pinterest: Try to get higher resolution version
    if (window.location.hostname.includes('pinterest')) {
      // Pinterest often has different size variants in the URL
      imageUrl = imageUrl.replace(/\/\d+x\d+\//g, '/originals/');
      imageUrl = imageUrl.replace(/_\d+\./g, '_original.');
    }
    
    // Instagram: Try to get higher resolution version
    if (window.location.hostname.includes('instagram')) {
      // Instagram images often have size parameters
      imageUrl = imageUrl.replace(/s\d+x\d+/g, 's1080x1080');
    }
    
    // General: Remove common size parameters
    imageUrl = imageUrl.replace(/[?&](w|width|h|height)=\d+/g, '');
    
    return imageUrl;
  }



  showSuccessMessage(message) {
    this.showMessage('✅ ' + message, 'success');
  }

  showErrorMessage(message) {
    this.showMessage('❌ ' + message, 'error');
  }

  showMessage(text, type) {
    const message = document.createElement('div');
    message.className = `soul-ai-message soul-ai-message-${type}`;
    message.textContent = text;
    
    document.body.appendChild(message);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 4000);
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(['contentScriptSettings']);
      const settings = result.contentScriptSettings || {};
      
      this.isEnabled = settings.enabled !== false; // Default to true
      
      if (!this.isEnabled) {
        // Hide all icons if disabled
        this.icons.forEach(icon => {
          icon.style.display = 'none';
        });
      }
    } catch (error) {
    // Error loading settings - silently handle
  }
  }
}

// Initialize the content script when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SoulAIContentScript();
  });
} else {
  new SoulAIContentScript();
}