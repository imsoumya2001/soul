// Background script for Soul AI Scene Transformation
class SoulAIBackground {
  constructor() {
    this.API_BASE_URL = 'https://soul-ai-jewelry-generator.vercel.app';
    this.referenceImage = null;
    this.init();
  }

  init() {
    this.setupMessageListeners();
    this.setupContextMenus();
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'setReferenceImage':
          this.handleSetReferenceImage(request, sendResponse);
          return true;
        
        case 'getReferenceImage':
          sendResponse({ success: true, referenceImage: this.referenceImage });
          break;
        
        case 'generateTransformation':
          this.handleGenerateTransformation(request, sendResponse);
          return true;
        
        case 'openPopup':
          this.openGenerationPage({ referenceImage: this.referenceImage });
          sendResponse({ success: true });
          break;
        
        case 'openActualPopup':
          this.openPopup();
          sendResponse({ success: true });
          break;
        
        case 'openGenerationPage':
          this.openGenerationPage(request.data);
          sendResponse({ success: true });
          break;
        
        default:
          sendResponse({ error: 'Unknown action' });
      }
    });
  }

  setupContextMenus() {
    chrome.contextMenus.create({
      id: 'soul-ai-transform',
      title: 'Use as Reference Scene',
      contexts: ['image'],
      documentUrlPatterns: ['http://*/*', 'https://*/*']
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'soul-ai-transform') {
        this.handleContextMenuClick(info, tab);
      }
    });
  }

  async handleSetReferenceImage(request, sendResponse) {
    try {
      this.referenceImage = {
        url: request.imageUrl,
        pageUrl: request.pageUrl,
        pageTitle: request.pageTitle,
        timestamp: Date.now()
      };
      
      // Store in chrome storage as well
      await chrome.storage.local.set({
        'referenceImage': this.referenceImage
      });
      
      sendResponse({ success: true });
    } catch (error) {
      // Error setting reference image - silently handle
      sendResponse({ success: false, error: error.message });
    }
  }

  async handleGenerateTransformation(request, sendResponse) {
    try {
      const formData = new FormData();
      
      // Add images
      if (request.referenceImage) {
        const referenceBlob = await this.urlToBlob(request.referenceImage);
        formData.append('referenceImage', referenceBlob, 'reference.jpg');
      }
      
      if (request.characterImage) {
        const characterBlob = await this.urlToBlob(request.characterImage);
        formData.append('characterImage', characterBlob, 'character.jpg');
      }
      
      // Add parameters
      formData.append('preserveClothing', request.preserveClothing || false);
      formData.append('preserveAccessories', request.preserveAccessories || false);
      formData.append('preserveExpression', request.preserveExpression || false);
      formData.append('copyPose', request.copyPose || false);
      formData.append('customInstructions', request.customInstructions || '');

      const response = await fetch(`${this.API_BASE_URL}/api/generate`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      sendResponse({ success: true, result });
    } catch (error) {
      // Transformation error - silently handle
      sendResponse({ success: false, error: error.message });
    }
  }

  async urlToBlob(url) {
    if (url.startsWith('data:')) {
      const response = await fetch(url);
      return response.blob();
    } else {
      const response = await fetch(url);
      return response.blob();
    }
  }

  async openPopup() {
    try {
      // Open the actual popup
      await chrome.action.openPopup();
    } catch (error) {
      // Error opening popup - silently handle
      // Fallback: create a new tab with popup.html if openPopup fails
      try {
        const popupUrl = chrome.runtime.getURL('popup.html');
        await chrome.tabs.create({ url: popupUrl, active: true });
      } catch (fallbackError) {
        // Error opening popup fallback - silently handle
      }
    }
  }

  async openGenerationPage(data) {
    try {
      // Store the generation data for the generation page
      await chrome.storage.local.set({
        'pendingGeneration': {
          ...data,
          timestamp: Date.now()
        }
      });

      // Open the generation page
      const generationUrl = chrome.runtime.getURL('generation.html');
      await chrome.tabs.create({ url: generationUrl });
    } catch (error) {
      // Error opening generation page - silently handle
    }
  }

  async handleContextMenuClick(info, tab) {
    try {
      // Set the image as reference
      await this.handleSetReferenceImage({
        imageUrl: info.srcUrl,
        pageUrl: info.pageUrl,
        pageTitle: tab.title
      }, () => {});

      // Open the generation page or popup
      const generationUrl = chrome.runtime.getURL('generation.html');
      await chrome.tabs.create({ url: generationUrl });
    } catch (error) {
    // Error handling context menu click - silently handle
  }
  }
}

// Initialize background script
new SoulAIBackground();

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Soul AI Jewelry Generator installed
    // Set default settings
    chrome.storage.local.set({
      'settings': {
        'autoDetect': true,
        'buttonPosition': 'top-right',
        'theme': 'default'
      }
    });
  }
});