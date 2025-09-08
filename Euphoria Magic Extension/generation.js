// Generation page script for Soul AI Scene Transformation
class SoulAIGeneration {
  constructor() {
    this.API_BASE_URL = 'https://soul-ai-jewelry-generator.vercel.app';
    this.referenceImage = null;
    this.characterImage = null;
    this.transformedImage = null;
    this.isGenerating = false;
    this.chatHistory = [];
    
    this.init();
  }

  init() {
    this.setupElements();
    this.setupEventListeners();
    this.loadStoredData();
    this.loadSettings();
  }

  setupElements() {
    // Image elements
    this.referenceImagePreview = document.getElementById('referenceImagePreview');
    this.characterImagePreview = document.getElementById('characterImagePreview');
    this.transformedImagePreview = document.getElementById('transformedImagePreview');
    this.characterImageInput = document.getElementById('characterImageInput');
    
    // Control elements
    this.preserveClothing = document.getElementById('preserveClothing');
    this.preserveAccessories = document.getElementById('preserveAccessories');
    this.preserveExpression = document.getElementById('preserveExpression');
    this.copyPose = document.getElementById('copyPose');
    this.customInstructions = document.getElementById('customInstructions');
    
    // Action buttons
    this.generateBtn = document.getElementById('generateBtn');
    this.regenerateBtn = document.getElementById('regenerateBtn');
    this.downloadBtn = document.getElementById('downloadBtn');
    this.shareBtn = document.getElementById('shareBtn');
    this.changeSceneBtn = document.getElementById('changeSceneBtn');
    this.uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    
    // Chat elements
    this.chatInput = document.getElementById('chatInput');
    this.sendChatBtn = document.getElementById('sendChatBtn');
    this.chatMessages = document.getElementById('chatMessages');
    
    // Loading elements
    this.loadingState = document.getElementById('loadingState');
    this.loadingText = document.getElementById('loadingText');
    this.progressFill = document.getElementById('progressFill');
    
    // Settings elements
    this.settingsBtn = document.getElementById('settingsBtn');
    this.settingsModal = document.getElementById('settingsModal');
    this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
    this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
    this.cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
    this.apiEndpoint = document.getElementById('apiEndpoint');
    this.qualityLevel = document.getElementById('qualityLevel');
    this.autoSave = document.getElementById('autoSave');
  }

  async loadStoredData() {
    try {
      // Load transformation data from storage
      const result = await chrome.storage.local.get(['transformationData', 'referenceImage', 'characterImage']);
      
      if (result.transformationData) {
        this.transformationData = result.transformationData;
        this.populateSettings(result.transformationData);
      }

      if (result.referenceImage) {
        this.referenceImage = result.referenceImage;
        this.displayReferenceImage(result.referenceImage);
      }

      if (result.characterImage) {
        this.characterImage = result.characterImage;
        this.displayCharacterImage(result.characterImage);
      }

      this.updateGenerateButton();
    } catch (error) {
      // Error loading initial data - silently handle
    }
  }

  loadSettings() {
    // Load user settings from storage
    chrome.storage.local.get(['apiEndpoint', 'qualityLevel', 'autoSave'], (result) => {
      if (result.apiEndpoint) {
        this.API_BASE_URL = result.apiEndpoint;
        if (this.apiEndpoint) this.apiEndpoint.value = result.apiEndpoint;
      }
      if (result.qualityLevel && this.qualityLevel) {
        this.qualityLevel.value = result.qualityLevel;
      }
      if (result.autoSave !== undefined && this.autoSave) {
        this.autoSave.checked = result.autoSave;
      }
    });
  }

  setupEventListeners() {
    // Image upload
    this.changeSceneBtn?.addEventListener('click', () => {
      this.handleChangeScene();
    });
    
    this.uploadPhotoBtn?.addEventListener('click', () => {
      this.characterImageInput.click();
    });
    
    this.characterImageInput?.addEventListener('change', (e) => {
      this.handleCharacterImageUpload(e);
    });
    
    // Generation
    this.generateBtn?.addEventListener('click', () => {
      this.handleGenerate();
    });
    
    this.regenerateBtn?.addEventListener('click', () => {
      this.handleRegenerate();
    });
    
    // Download and share
    this.downloadBtn?.addEventListener('click', () => {
      this.handleDownload();
    });
    
    this.shareBtn?.addEventListener('click', () => {
      this.handleShare();
    });
    
    // Chat
    this.chatInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleChatSend();
      }
    });
    
    this.sendChatBtn?.addEventListener('click', () => {
      this.handleChatSend();
    });
    
    // Settings
    this.settingsBtn?.addEventListener('click', () => {
      this.openSettings();
    });
    
    this.closeSettingsBtn?.addEventListener('click', () => {
      this.closeSettings();
    });
    
    this.saveSettingsBtn?.addEventListener('click', () => {
      this.saveSettings();
    });
    
    this.cancelSettingsBtn?.addEventListener('click', () => {
      this.closeSettings();
    });
    
    // Click outside modal to close
    this.settingsModal?.addEventListener('click', (e) => {
      if (e.target === this.settingsModal) {
        this.closeSettings();
      }
    });
    
    // Update generate button when options change
    [this.preserveClothing, this.preserveAccessories, this.preserveExpression, this.copyPose].forEach(checkbox => {
      checkbox?.addEventListener('change', () => {
        this.updateGenerateButton();
      });
    });
  }

  setupSliders() {
    // Strength slider
    const strengthSlider = document.getElementById('strengthSlider');
    const strengthValue = document.getElementById('strengthValue');
    strengthSlider.addEventListener('input', (e) => {
      strengthValue.textContent = e.target.value;
    });

    // Guidance slider
    const guidanceSlider = document.getElementById('guidanceSlider');
    const guidanceValue = document.getElementById('guidanceValue');
    guidanceSlider.addEventListener('input', (e) => {
      guidanceValue.textContent = e.target.value;
    });

    // Steps slider
    const stepsSlider = document.getElementById('stepsSlider');
    const stepsValue = document.getElementById('stepsValue');
    stepsSlider.addEventListener('input', (e) => {
      stepsValue.textContent = e.target.value;
    });
  }

  async loadInitialData() {
    try {
      // Load generation data from storage
      const result = await chrome.storage.local.get(['generationData', 'currentImage']);
      
      if (result.generationData) {
        this.generationData = result.generationData;
        this.populateSettings(result.generationData);
      }

      if (result.currentImage) {
        this.currentImage = result.currentImage;
        this.displaySourceImage(result.currentImage);
      }

      // Check if we have uploaded image from popup
      if (this.generationData && this.generationData.uploadedImage) {
        this.currentImage = {
          data: this.generationData.uploadedImage,
          url: null
        };
        this.displaySourceImage(this.currentImage);
      }

      this.updateGenerateButton();
    } catch (error) {
      // Error loading initial data - silently handle
    }
  }

  populateSettings(data) {
    if (data.character) {
      document.getElementById('characterSelect').value = data.character;
    }
    if (data.jewelryType) {
      document.getElementById('jewelrySelect').value = data.jewelryType;
    }
    if (data.style) {
      document.getElementById('styleSelect').value = data.style;
    }
  }

  displaySourceImage(imageData) {
    const preview = document.getElementById('sourceImagePreview');
    const img = document.createElement('img');
    img.src = imageData.data || imageData.url;
    img.alt = 'Source image';
    preview.innerHTML = '';
    preview.appendChild(img);
  }

  async handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    try {
      const imageData = await this.fileToDataURL(file);
      this.currentImage = {
        data: imageData,
        url: null
      };
      this.displaySourceImage(this.currentImage);
      this.updateGenerateButton();
    } catch (error) {
      // Error uploading image - silently handle
      // Failed to upload image - show user-friendly message
      this.showStatus('Failed to upload image. Please try again.');
    }
  }

  fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  updateGenerateButton() {
    if (this.generateBtn) {
      this.generateBtn.disabled = !this.referenceImage || !this.characterImage;
    }
  }

  triggerConfetti() {
    if (typeof window.bananaConfetti !== 'undefined' && this.generateBtn) {
      const rect = this.generateBtn.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      
      window.bananaConfetti.fire({
        particleCount: 50,
        spread: 70,
        origin: { x, y },
        colors: ['#FFD700', '#FFA500', '#FF8C00']
      });
    }
  }

  async handleGenerate() {
    if (this.isGenerating || !this.referenceImage || !this.characterImage) return;
    
    // Trigger confetti animation
    this.triggerConfetti();
    
    this.isGenerating = true;
    this.showLoading('Transforming your scene...');
    
    try {
      const transformationData = {
        referenceImage: this.referenceImage.url || this.referenceImage,
        characterImage: this.characterImage,
        preserveClothing: this.preserveClothing.checked,
        preserveAccessories: this.preserveAccessories.checked,
        preserveExpression: this.preserveExpression.checked,
        copyPose: this.copyPose.checked,
        customInstructions: this.customInstructions.value
      };
      
      const response = await chrome.runtime.sendMessage({
        action: 'generateTransformation',
        ...transformationData
      });
      
      if (response.success) {
        this.transformedImage = response.result.imageUrl;
        this.displayTransformedImage(response.result.imageUrl);
        this.enableResultActions();
        this.enableChat();
        
        // Save to history
        this.saveToHistory(transformationData, response.result);
      } else {
        throw new Error(response.error || 'Transformation failed');
      }
    } catch (error) {
      // Transformation error - silently handle
      this.showError('Failed to transform scene. Please try again.');
    } finally {
      this.isGenerating = false;
      this.hideLoading();
    }
  }

  handleChangeScene() {
    // Open file picker for new reference image
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleReferenceImageUpload({ target: { files: [file] } });
      }
    };
    input.click();
  }
  
  handleCharacterImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.characterImage = e.target.result;
      this.displayCharacterImage(e.target.result);
      this.updateGenerateButton();
    };
    reader.readAsDataURL(file);
  }
  
  handleReferenceImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.referenceImage = e.target.result;
      this.displayReferenceImage(e.target.result);
      this.updateGenerateButton();
    };
    reader.readAsDataURL(file);
  }
  
  displayReferenceImage(imageData) {
    const preview = this.referenceImagePreview;
    const img = document.createElement('img');
    img.src = imageData;
    img.alt = 'Reference image';
    preview.innerHTML = '';
    preview.appendChild(img);
  }
  
  displayCharacterImage(imageData) {
    const preview = this.characterImagePreview;
    const img = document.createElement('img');
    img.src = imageData;
    img.alt = 'Character image';
    preview.innerHTML = '';
    preview.appendChild(img);
  }
  
  displayTransformedImage(imageData) {
    const preview = this.transformedImagePreview;
    const img = document.createElement('img');
    img.src = imageData;
    img.alt = 'Transformed image';
    preview.innerHTML = '';
    preview.appendChild(img);
  }

  async handleRegenerate() {
    await this.handleGenerate();
  }

  getGenerationParams() {
    return {
      image: this.currentImage.data,
      character: document.getElementById('characterSelect').value,
      jewelryType: document.getElementById('jewelrySelect').value,
      style: document.getElementById('styleSelect').value,
      strength: parseFloat(document.getElementById('strengthSlider').value),
      guidanceScale: parseInt(document.getElementById('guidanceSlider').value),
      steps: parseInt(document.getElementById('stepsSlider').value)
    };
  }

  async callGenerateAPI(params) {
    const response = await fetch(`${this.API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  displayGeneratedImage(imageUrl) {
    const preview = document.getElementById('generatedImagePreview');
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Generated jewelry';
    preview.innerHTML = '';
    preview.appendChild(img);
  }

  enableChat() {
    document.getElementById('chatInput').disabled = false;
    document.getElementById('sendChatBtn').disabled = false;
  }

  showLoading(message) {
    const loadingState = document.getElementById('loadingState');
    const loadingText = document.getElementById('loadingText');
    const progressFill = document.getElementById('progressFill');
    
    loadingText.textContent = message;
    loadingState.classList.remove('hidden');
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) progress = 90;
      progressFill.style.width = `${progress}%`;
    }, 500);
    
    // Store interval for cleanup
    this.progressInterval = interval;
  }

  hideLoading() {
    const loadingState = document.getElementById('loadingState');
    const progressFill = document.getElementById('progressFill');
    
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    
    progressFill.style.width = '100%';
    setTimeout(() => {
      loadingState.classList.add('hidden');
      progressFill.style.width = '0%';
    }, 500);
  }

  async handleChatSend() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message || !this.generatedImage) return;
    
    // Add user message to chat
    this.addChatMessage(message, 'user');
    chatInput.value = '';
    
    try {
      // Show typing indicator
      this.addChatMessage('Applying your changes...', 'assistant', true);
      
      // Call chat-to-edit API
      const result = await this.callChatEditAPI(message);
      
      // Remove typing indicator and add result
      this.removeChatMessage();
      this.addChatMessage('I\'ve updated your design based on your request!', 'assistant');
      
      // Update generated image
      this.generatedImage = result.imageUrl;
      this.displayGeneratedImage(result.imageUrl);
      
    } catch (error) {
      console.error('Chat edit error:', error);
      this.removeChatMessage();
      this.addChatMessage('Sorry, I couldn\'t apply those changes. Please try again.', 'assistant');
    }
  }

  async callChatEditAPI(message) {
    const params = {
      ...this.getGenerationParams(),
      editInstruction: message,
      baseImage: this.generatedImage
    };

    const response = await fetch(`${this.API_BASE_URL}/api/chat-edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  addChatMessage(message, sender, isTyping = false) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = isTyping ? 
      `<p>${message} <span class="typing-dots">...</span></p>` : 
      `<p>${message}</p>`;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    this.chatHistory.push({ message, sender, timestamp: Date.now() });
  }

  removeChatMessage() {
    const chatMessages = document.getElementById('chatMessages');
    const lastMessage = chatMessages.lastElementChild;
    if (lastMessage) {
      chatMessages.removeChild(lastMessage);
      this.chatHistory.pop();
    }
  }

  handleDownload() {
    if (!this.transformedImage) return;
    
    const link = document.createElement('a');
    link.href = this.transformedImage;
    link.download = `soul-ai-transformation-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  handleShare() {
    if (!this.transformedImage) return;
    
    if (navigator.share) {
      navigator.share({
        title: 'Soul AI Scene Transformation',
        text: 'Check out my AI-transformed scene!',
        url: this.transformedImage
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(this.transformedImage);
      this.showMessage('Image URL copied to clipboard!');
    }
  }
  
  showError(message) {
    // Show error message to user - silently handle
    this.showStatus(message);
  }
  
  showMessage(message) {
    // Show success message to user - silently handle
    // You could implement a toast notification here
  }
  
  saveToHistory(transformationData, result) {
    // Save transformation to history
    const historyItem = {
      timestamp: Date.now(),
      transformationData,
      result
    };
    
    chrome.storage.local.get(['transformationHistory'], (data) => {
      const history = data.transformationHistory || [];
      history.unshift(historyItem);
      // Keep only last 10 transformations
      if (history.length > 10) {
        history.splice(10);
      }
      chrome.storage.local.set({ transformationHistory: history });
    });
  }
  
  openSettings() {
    if (this.settingsModal) {
      this.settingsModal.classList.remove('hidden');
    }
  }
  
  closeSettings() {
    if (this.settingsModal) {
      this.settingsModal.classList.add('hidden');
    }
  }
  
  saveSettings() {
    const settings = {
      apiEndpoint: this.apiEndpoint?.value || this.API_BASE_URL,
      qualityLevel: this.qualityLevel?.value || 'high',
      autoSave: this.autoSave?.checked || false
    };
    
    chrome.storage.local.set(settings, () => {
      this.API_BASE_URL = settings.apiEndpoint;
      this.closeSettings();
      this.showMessage('Settings saved successfully!');
    });
  }

  handleNewGeneration() {
    // Reset the interface for a new transformation
    this.transformedImage = null;
    this.referenceImage = null;
    this.characterImage = null;
    this.chatHistory = [];
    
    // Clear displays
    if (this.referenceImagePreview) {
      this.referenceImagePreview.innerHTML = '<div class="placeholder">Select a scene image</div>';
    }
    
    if (this.characterImagePreview) {
      this.characterImagePreview.innerHTML = '<div class="placeholder">Upload your photo</div>';
    }
    
    if (this.transformedImagePreview) {
      this.transformedImagePreview.innerHTML = '<div class="placeholder">Transformed image will appear here</div>';
    }
    
    // Reset controls
    if (this.preserveClothing) this.preserveClothing.checked = true;
    if (this.preserveAccessories) this.preserveAccessories.checked = true;
    if (this.preserveExpression) this.preserveExpression.checked = false;
    if (this.copyPose) this.copyPose.checked = false;
    if (this.customInstructions) this.customInstructions.value = '';
    
    // Disable result actions
    if (this.regenerateBtn) this.regenerateBtn.disabled = true;
    if (this.downloadBtn) this.downloadBtn.disabled = true;
    if (this.shareBtn) this.shareBtn.disabled = true;
    
    // Clear and disable chat
    if (this.chatMessages) {
      this.chatMessages.innerHTML = `
        <div class="chat-message system">
          <div class="message-content">
            <p>👋 Hi! I can help you refine your scene transformation. Try saying things like:</p>
            <ul>
              <li>"Make the lighting warmer"</li>
              <li>"Add more details to the background"</li>
              <li>"Change the mood to more dramatic"</li>
              <li>"Adjust the colors"</li>
            </ul>
          </div>
        </div>
      `;
    }
    
    if (this.chatInput) this.chatInput.disabled = true;
    if (this.sendChatBtn) this.sendChatBtn.disabled = true;
    if (this.chatInput) this.chatInput.value = '';
    
    // Update generate button
    this.updateGenerateButton();
  }
  
  disableResultActions() {
    if (this.regenerateBtn) this.regenerateBtn.disabled = true;
    if (this.downloadBtn) this.downloadBtn.disabled = true;
    if (this.shareBtn) this.shareBtn.disabled = true;
  }
  
  disableChat() {
    if (this.chatInput) this.chatInput.disabled = true;
    if (this.sendChatBtn) this.sendChatBtn.disabled = true;
  }
  
  enableResultActions() {
    if (this.regenerateBtn) this.regenerateBtn.disabled = false;
    if (this.downloadBtn) this.downloadBtn.disabled = false;
    if (this.shareBtn) this.shareBtn.disabled = false;
  }
  
  enableChat() {
    if (this.chatInput) this.chatInput.disabled = false;
    if (this.sendChatBtn) this.sendChatBtn.disabled = false;
  }
  
  showLoading(message = 'Processing...') {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    
    if (loadingText) {
      loadingText.textContent = message;
    }
    
    if (loadingOverlay) {
      loadingOverlay.classList.remove('hidden');
    }
  }
  
  hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
  }
  
  async handleChatSend() {
    const message = this.chatInput?.value.trim();
    if (!message || !this.transformedImage) return;
    
    // Add user message to chat
    this.addChatMessage(message, 'user');
    this.chatInput.value = '';
    
    try {
      // Send chat message to background script
      const response = await chrome.runtime.sendMessage({
        action: 'chatEdit',
        message: message,
        currentImage: this.transformedImage,
        referenceImage: this.referenceImage,
        characterImage: this.characterImage
      });
      
      if (response.success) {
        // Add AI response to chat
        this.addChatMessage(response.reply, 'assistant');
        
        // If there's a new image, update the display
        if (response.newImage) {
          this.transformedImage = response.newImage;
          this.displayTransformedImage(response.newImage);
        }
      } else {
        this.addChatMessage('Sorry, I encountered an error. Please try again.', 'assistant');
      }
    } catch (error) {
      // Chat error - silently handle
      this.addChatMessage('Sorry, I encountered an error. Please try again.', 'assistant');
    }
  }
  
  addChatMessage(message, sender) {
    if (!this.chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = message;
    
    messageDiv.appendChild(contentDiv);
    this.chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SoulAIGeneration();
  });
} else {
  new SoulAIGeneration();
}

// Initialize generation page when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SoulAIGeneration();
  });
} else {
  new SoulAIGeneration();
}