// Popup script for Soul AI Scene Transformation
class SoulAIPopup {
  constructor() {
    this.geminiApiKey = null;
    this.falApiKey = null;
    this.referenceImage = null;
    this.characterImage = null;
    this.preserveClothing = false;
    this.preserveAccessories = false;
    this.preserveExpression = false;
    this.copyPose = false;
    this.customInstructions = '';
    this.generatedImageUrl = null;
    this.generatedVideoUrl = null;
    this.isApiSectionExpanded = false;
    
    this.initializeElements();
    this.attachEventListeners();
    this.setupAdvancedOptions();
    this.loadStoredApiKeys();
    this.loadStoredReferenceImage();
    this.loadCurrentPageImage();
  }

  initializeElements() {
    // API Configuration
    this.geminiApiKeyInput = document.getElementById('geminiApiKeyInput');
    this.falApiKeyInput = document.getElementById('falApiKeyInput');
    this.saveApiKeysBtn = document.getElementById('saveApiKeysBtn');
    this.apiMinimized = document.getElementById('apiMinimized');
    this.apiExpanded = document.getElementById('apiExpanded');
    this.apiError = document.getElementById('apiError');
    this.apiExpandBtn = document.getElementById('apiExpandBtn');
    this.apiExpandBtnError = document.getElementById('apiExpandBtnError');
    this.apiStatusDot = document.getElementById('apiStatusDot');
    this.apiStatusText = document.getElementById('apiStatusText');
    
    this.generateBtn = document.getElementById('generateBtn');
    this.statusDisplay = document.getElementById('statusDisplay');
    this.statusText = document.getElementById('statusText');
    
    this.referenceFileInput = document.getElementById('referenceFileInput');
    this.characterFileInput = document.getElementById('characterFileInput');
    this.referenceImageArea = document.getElementById('referenceImageArea');
    this.characterImageArea = document.getElementById('characterImageArea');
    this.referencePreview = document.getElementById('referencePreview');
    this.characterPreview = document.getElementById('characterPreview');
    
    // Remove buttons
    this.removeReferenceBtn = document.getElementById('removeReferenceBtn');
    this.removeCharacterBtn = document.getElementById('removeCharacterBtn');
    
    // Generated results elements
    this.generatedResults = document.getElementById('generatedResults');
    this.generatedImage = document.getElementById('generatedImage');
    this.downloadBtn = document.getElementById('downloadBtn');
    this.regenerateBtn = document.getElementById('regenerateBtn');
    this.chatToEditBtn = document.getElementById('chatToEditBtn');
    this.liveVideoBtn = document.getElementById('liveVideoBtn');
    
    // Video elements
    this.videoLoadingState = document.getElementById('videoLoadingState');
    this.generatedVideoResults = document.getElementById('generatedVideoResults');
    this.generatedVideo = document.getElementById('generatedVideo');
    this.videoSource = document.getElementById('videoSource');
    this.downloadVideoBtn = document.getElementById('downloadVideoBtn');
    this.copyVideoBtn = document.getElementById('copyVideoBtn');
    
    // Chat elements
    this.chatInterface = document.getElementById('chatInterface');
    this.chatMessages = document.getElementById('chatMessages');
    this.chatInput = document.getElementById('chatInput');
    this.sendChatBtn = document.getElementById('sendChatBtn');
    this.closeChatBtn = document.getElementById('closeChatBtn');
    this.chatGeneratedResults = document.getElementById('chatGeneratedResults');
    this.chatGeneratedImage = document.getElementById('chatGeneratedImage');
    this.downloadChatBtn = document.getElementById('downloadChatBtn');
    this.regenerateChatBtn = document.getElementById('regenerateChatBtn');
    this.continueChatBtn = document.getElementById('continueChatBtn');
    this.copyChatImageBtn = document.getElementById('copyChatImageBtn');
    
    // Advanced options - handle missing elements gracefully
    this.preserveClothingInput = document.getElementById('preserveClothing');
    this.preserveAccessoriesInput = document.getElementById('preserveAccessories');
    this.preserveExpressionInput = document.getElementById('preserveExpression');
    this.copyPoseInput = document.getElementById('copyPose');
    this.customInstructionsInput = document.getElementById('customInstructions');
    
    // Per-container hover generate buttons (queried later as they are inside containers)
    this.currentHoveredImage = null;
    
    // Check for missing critical elements
    const criticalElements = [
      'geminiApiKeyInput', 'falApiKeyInput', 'generateBtn', 'referenceImageArea', 'characterImageArea'
    ];
    
    for (const elementId of criticalElements) {
      if (!document.getElementById(elementId)) {
        // Critical element missing - silently handle
      }
    }
  }

  attachEventListeners() {
    // API Key configuration
    if (this.saveApiKeysBtn) {
      this.saveApiKeysBtn.addEventListener('click', () => {
        this.saveApiKeys();
      });
    }
    
    if (this.geminiApiKeyInput) {
      this.geminiApiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.saveApiKeys();
        }
      });
    }
    
    if (this.falApiKeyInput) {
      this.falApiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.saveApiKeys();
        }
      });
    }
    
    if (this.apiExpandBtn) {
      this.apiExpandBtn.addEventListener('click', () => {
        this.toggleApiSection();
      });
    }
    
    if (this.apiExpandBtnError) {
      this.apiExpandBtnError.addEventListener('click', () => {
        this.toggleApiSection();
      });
    }
    
    // Image upload areas - only trigger on placeholder click
    if (this.referenceImageArea) {
      this.referenceImageArea.addEventListener('click', (e) => {
        if (e.target.closest('.upload-placeholder')) {
          this.referenceFileInput?.click();
        }
      });
    }
    if (this.characterImageArea) {
      this.characterImageArea.addEventListener('click', (e) => {
        // Make entire character upload area clickable, but avoid clicks on remove button
        if (!e.target.closest('.remove-image-btn') && !e.target.closest('.image-container')) {
          this.characterFileInput?.click();
        }
      });
      
      // Add drag and drop functionality
      this.characterImageArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.characterImageArea.classList.add('drag-over');
      });
      
      this.characterImageArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        this.characterImageArea.classList.remove('drag-over');
      });
      
      this.characterImageArea.addEventListener('drop', (e) => {
        e.preventDefault();
        this.characterImageArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          const file = files[0];
          if (file.type.startsWith('image/')) {
            this.handleCharacterUpload({ target: { files: [file] } });
          }
        }
      });
    }
    
    // File inputs
    if (this.referenceFileInput) {
      this.referenceFileInput.addEventListener('change', (e) => this.handleReferenceUpload(e));
    }
    if (this.characterFileInput) {
      this.characterFileInput.addEventListener('change', (e) => this.handleCharacterUpload(e));
    }
    
    // Remove buttons
    if (this.removeReferenceBtn) {
      this.removeReferenceBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeReferenceImage();
      });
    }
    if (this.removeCharacterBtn) {
      this.removeCharacterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeCharacterImage();
      });
    }
    
    // Button events
    if (this.generateBtn) {
      this.generateBtn.addEventListener('click', () => this.generateTransformation());
    }
    
    if (this.downloadBtn) {
      this.downloadBtn.addEventListener('click', () => {
        this.downloadGeneratedImage();
      });
    }
    
    if (this.regenerateBtn) {
      this.regenerateBtn.addEventListener('click', () => this.generateTransformation());
    }
    
    if (this.chatToEditBtn) {
      this.chatToEditBtn.addEventListener('click', () => this.openChatToEdit());
    }
    
    // Setup per-container hover generate buttons

    // Setup copy image button
    const copyImageBtn = document.getElementById('copyImageBtn');
    if (copyImageBtn) {
      copyImageBtn.addEventListener('click', () => {
        this.copyImageToClipboard();
      });
    }

    // Setup chat to edit button
    const chatToEditBtn = document.getElementById('chatToEditBtn');
    if (chatToEditBtn) {
      chatToEditBtn.addEventListener('click', () => {
        this.openChatToEdit();
      });
    }
    
    // Live Video button
    if (this.liveVideoBtn) {
      this.liveVideoBtn.addEventListener('click', () => {
        this.generateVideo();
      });
    }
    
    // Video download button
    if (this.downloadVideoBtn) {
      this.downloadVideoBtn.addEventListener('click', () => {
        this.downloadGeneratedVideo();
      });
    }
    
    // Video copy button
    if (this.copyVideoBtn) {
      this.copyVideoBtn.addEventListener('click', () => {
        this.copyVideoToClipboard();
      });
    }
    
    // Chat interface event listeners
    if (this.chatInput) {
      this.chatInput.addEventListener('input', () => {
        this.sendChatBtn.disabled = this.chatInput.value.trim() === '';
      });
      
      this.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (this.chatInput.value.trim() !== '') {
            this.sendChatMessage();
          }
        }
      });
    }
    
    if (this.sendChatBtn) {
      this.sendChatBtn.addEventListener('click', () => {
        this.sendChatMessage();
      });
    }
    
    if (this.closeChatBtn) {
      this.closeChatBtn.addEventListener('click', () => {
        this.closeChatInterface();
      });
    }
    
    if (this.downloadChatBtn) {
      this.downloadChatBtn.addEventListener('click', () => {
        this.downloadChatImage();
      });
    }
    
    if (this.regenerateChatBtn) {
      this.regenerateChatBtn.addEventListener('click', () => {
        this.regenerateChatImage();
      });
    }
    
    if (this.continueChatBtn) {
      this.continueChatBtn.addEventListener('click', () => {
        this.continueChatFromResult();
      });
    }
    
    if (this.copyChatImageBtn) {
      this.copyChatImageBtn.addEventListener('click', () => {
        this.copyChatImageToClipboard();
      });
    }
  }

   updateGenerateButton() {
    const isReady = this.referenceImage && this.characterImage;
    this.generateBtn.disabled = !isReady;
  }

  setupAdvancedOptions() {
    // Advanced options
    if (this.preserveClothingInput) {
      this.preserveClothingInput.addEventListener('change', (e) => {
        this.preserveClothing = e.target.checked;
      });
    }
    if (this.preserveAccessoriesInput) {
      this.preserveAccessoriesInput.addEventListener('change', (e) => {
        this.preserveAccessories = e.target.checked;
      });
    }
    if (this.preserveExpressionInput) {
      this.preserveExpressionInput.addEventListener('change', (e) => {
        this.preserveExpression = e.target.checked;
      });
    }
    if (this.copyPoseInput) {
      this.copyPoseInput.addEventListener('change', (e) => {
        this.copyPose = e.target.checked;
      });
    }
    if (this.customInstructionsInput) {
      this.customInstructionsInput.addEventListener('input', (e) => {
        this.customInstructions = e.target.value;
      });
    }
  }

  loadStoredApiKeys() {
    chrome.storage.local.get(['geminiApiKey', 'falApiKey'], (result) => {
      if (result.geminiApiKey) {
        this.geminiApiKey = result.geminiApiKey;
        this.geminiApiKeyInput.value = '••••••••••••••••';
        this.geminiApiKeyInput.style.borderColor = '#10b981';
      }
      
      if (result.falApiKey) {
        this.falApiKey = result.falApiKey;
        this.falApiKeyInput.value = '••••••••••••••••';
        this.falApiKeyInput.style.borderColor = '#10b981';
      }
      
      this.updateApiStatus();
       
       if (result.geminiApiKey) {
         this.showMinimizedApiSection();
       } else {
         this.showExpandedApiSection();
       }
    });
  }
  
  saveApiKeys() {
     const geminiApiKey = this.geminiApiKeyInput?.value?.trim();
     const falApiKey = this.falApiKeyInput?.value?.trim();
     
     // Validate keys (don't save if they're masked values)
     const validGeminiKey = geminiApiKey && geminiApiKey !== '••••••••••••••••' ? geminiApiKey : this.geminiApiKey;
     const validFalKey = falApiKey && falApiKey !== '••••••••••••••••' ? falApiKey : this.falApiKey;
     
     // Only Gemini API key is mandatory
     if (!validGeminiKey) {
       if (this.saveApiKeysBtn) {
         this.saveApiKeysBtn.textContent = 'Gemini Key Required';
         this.saveApiKeysBtn.style.backgroundColor = '#ef4444';
         setTimeout(() => {
           this.saveApiKeysBtn.textContent = 'Save Keys';
           this.saveApiKeysBtn.style.backgroundColor = '';
         }, 2000);
       }
       return;
     }
    
    this.geminiApiKey = validGeminiKey;
    this.falApiKey = validFalKey;
    
    if (this.saveApiKeysBtn) {
      this.saveApiKeysBtn.textContent = 'Saving...';
      this.saveApiKeysBtn.disabled = true;
    }
    
    chrome.storage.local.set({ 
      geminiApiKey: validGeminiKey,
      falApiKey: validFalKey
    }, () => {
      if (this.geminiApiKeyInput) {
        this.geminiApiKeyInput.value = '••••••••••••••••';
        this.geminiApiKeyInput.style.borderColor = '#10b981';
      }
      if (this.falApiKeyInput) {
        this.falApiKeyInput.value = '••••••••••••••••';
        this.falApiKeyInput.style.borderColor = '#10b981';
      }
      
      this.updateApiStatus();
      
      if (this.saveApiKeysBtn) {
        this.saveApiKeysBtn.textContent = 'Saved!';
        this.saveApiKeysBtn.style.backgroundColor = '#10b981';
        setTimeout(() => {
          this.saveApiKeysBtn.textContent = 'Save API Keys';
          this.saveApiKeysBtn.style.backgroundColor = '';
          this.saveApiKeysBtn.disabled = false;
          this.showMinimizedApiSection();
        }, 1500);
      }
    });
  }

  updateApiStatus() {
     const hasGeminiKey = !!this.geminiApiKey;
     const hasFalKey = !!this.falApiKey;
     const keyCount = (hasGeminiKey ? 1 : 0) + (hasFalKey ? 1 : 0);
     
     if (this.apiStatusDot && this.apiStatusText) {
       if (hasGeminiKey) {
         this.apiStatusDot.className = 'api-status-dot';
         this.apiStatusText.textContent = `API Keys Connected (${keyCount}/2)`;
       } else {
         this.apiStatusDot.className = 'api-error-dot';
         this.apiStatusText.textContent = 'Please enter your API key';
       }
     }
     
     // Show/hide error state based on mandatory Gemini key
     if (this.apiMinimized && this.apiError) {
       if (hasGeminiKey) {
         this.apiMinimized.classList.remove('hidden');
         this.apiError.classList.add('hidden');
       } else {
         this.apiMinimized.classList.add('hidden');
         this.apiError.classList.remove('hidden');
       }
     }
   }

  toggleApiSection() {
    this.isApiSectionExpanded = !this.isApiSectionExpanded;
    
    if (this.isApiSectionExpanded) {
      this.showExpandedApiSection();
    } else {
      this.showMinimizedApiSection();
    }
  }

  showMinimizedApiSection() {
    this.isApiSectionExpanded = false;
    
    if (this.apiExpanded) {
      this.apiExpanded.classList.add('hidden');
    }
    
    this.updateApiStatus();
  }

  showExpandedApiSection() {
    this.isApiSectionExpanded = true;
    
    if (this.apiMinimized) {
      this.apiMinimized.classList.add('hidden');
    }
    if (this.apiError) {
      this.apiError.classList.add('hidden');
    }
    if (this.apiExpanded) {
      this.apiExpanded.classList.remove('hidden');
    }
  }

  async loadStoredReferenceImage() {
    try {
      const result = await chrome.storage.local.get(['referenceImage']);
      if (result.referenceImage && result.referenceImage.url) {
        this.setReferenceImage(result.referenceImage.url);
        // Show a success message that the image was loaded
        this.showStatus('Reference image loaded from your selection!');
        setTimeout(() => this.hideStatus(), 3000);
      }
    } catch (error) {
      // Error loading stored reference image - silently handle
    }
  }

  async loadCurrentPageImage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          const images = Array.from(document.querySelectorAll('img'));
          const validImages = images.filter(img => 
            img.src && 
            img.offsetWidth > 200 && 
            img.offsetHeight > 200 &&
            !img.src.includes('data:') &&
            !img.src.includes('blob:') &&
            !img.src.includes('icon') &&
            !img.src.includes('logo')
          );
          
          if (validImages.length > 0) {
            return validImages[0].src;
          }
          return null;
        }
      });

      if (results[0]?.result) {
        this.currentPageImage = results[0].result;
      }
    } catch (error) {
      // Error loading current page image - silently handle
    }
  }

  setReferenceImage(imageSrc) {
    this.referenceImage = imageSrc;
    this.referencePreview.src = imageSrc;
    
    // Show image container and hide placeholder
    const imageContainer = this.referenceImageArea.querySelector('.image-container');
    const placeholder = this.referenceImageArea.querySelector('.upload-placeholder');
    
    imageContainer.classList.remove('hidden');
    placeholder.style.display = 'none';
    this.referenceImageArea.classList.add('has-image');
    this.updateGenerateButton();
  }

  setCharacterImage(imageSrc) {
    this.characterImage = imageSrc;
    this.characterPreview.src = imageSrc;
    
    // Show image container and hide placeholder
    const imageContainer = this.characterImageArea.querySelector('.image-container');
    const placeholder = this.characterImageArea.querySelector('.upload-placeholder');
    
    imageContainer.classList.remove('hidden');
    placeholder.style.display = 'none';
    this.characterImageArea.classList.add('has-image');
    this.updateGenerateButton();
  }

  removeReferenceImage() {
    this.referenceImage = null;
    this.referencePreview.src = '';
    
    // Hide image container and show placeholder
    const imageContainer = this.referenceImageArea.querySelector('.image-container');
    const placeholder = this.referenceImageArea.querySelector('.upload-placeholder');
    
    imageContainer.classList.add('hidden');
    placeholder.style.display = 'flex';
    this.referenceImageArea.classList.remove('has-image');
    
    // Clear file input
    this.referenceFileInput.value = '';
    this.updateGenerateButton();
  }

  removeCharacterImage() {
    this.characterImage = null;
    this.characterPreview.src = '';
    
    // Hide image container and show placeholder
    const imageContainer = this.characterImageArea.querySelector('.image-container');
    const placeholder = this.characterImageArea.querySelector('.upload-placeholder');
    
    imageContainer.classList.add('hidden');
    placeholder.style.display = 'flex';
    this.characterImageArea.classList.remove('has-image');
    
    // Clear file input
    this.characterFileInput.value = '';
    this.updateGenerateButton();
  }

  handleReferenceUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.setReferenceImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  handleCharacterUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.setCharacterImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  triggerConfetti() {
    if (typeof window.bananaConfetti !== 'undefined') {
      const generateButton = this.generateBtn;
      const rect = generateButton.getBoundingClientRect();
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

  async generateTransformation() {
    if (!this.referenceImage || !this.characterImage) {
      this.showStatus('Please upload both reference and character images');
      return;
    }

    if (!this.geminiApiKey) {
       this.showStatus('Please configure your Gemini API key first');
       return;
     }

    // Trigger confetti animation
    this.triggerConfetti();
    
    this.showEnhancedLoading();
    this.generateBtn.disabled = true;
    this.generatedResults.classList.add('hidden');

    try {
      // Convert images to base64 if they're not already
      const referenceBase64 = await this.imageToBase64(this.referenceImage);
      const characterBase64 = await this.imageToBase64(this.characterImage);

      // Build the system prompt exactly like the web app
       let prompt = `Replace the person in the REFERENCE IMAGE (first image) with the person in the CHARACTER IMAGE (second image). Relight the CHARACTER to blend in with the ambience, and replace its attire, accessories and pose as per its gender and age group. Preserve the character's skin tone, facial features and structure, hairstyle, body physique etc.`;
       
       // Add parameter-specific instructions
       const preservationInstructions = [];
       if (this.preserveClothing) {
         preservationInstructions.push('preserve the clothing style from the CHARACTER IMAGE');
       }
       if (this.preserveAccessories) {
         preservationInstructions.push('preserve accessories from the CHARACTER IMAGE');
       }
       if (this.preserveExpression) {
         preservationInstructions.push('preserve the facial expression from the CHARACTER IMAGE');
       }
       
       if (preservationInstructions.length > 0) {
         prompt += ` However, ${preservationInstructions.join(', ')}.`;
       }
       
       // Add pose copying instruction if enabled
       if (this.copyPose) {
         prompt += ` Replicate the pose, posture, and orientation of the person in the REFERENCE IMAGE exactly, while applying it to the CHARACTER.`;
       }
       
       if (this.customInstructions) {
         prompt += ` Additional requirements: ${this.customInstructions}.`;
       }

      // Structure the request with clearly labeled images
      const requestBody = {
        contents: [{
          parts: [
            { text: "REFERENCE IMAGE (the scene/environment to copy):" },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: referenceBase64
              }
            },
            { text: "CHARACTER IMAGE (the person to place in the scene):" },
            {
              inline_data: {
                mime_type: 'image/jpeg', 
                data: characterBase64
              }
            },
            { text: prompt }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096
        }
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API Error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      
      // Check if the response contains candidates
      if (!result.candidates || result.candidates.length === 0) {
        throw new Error('No image generated');
      }
      
      const candidate = result.candidates[0];
      
      // Extract the generated image data by iterating through all parts
      let imageData = null;
      let mimeType = 'image/png';
      
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            imageData = part.inlineData.data;
            mimeType = part.inlineData.mimeType || 'image/png';
            break;
          }
        }
      }
      
      if (!imageData) {
        throw new Error('No image data in response');
      }
      
      // Display the generated image
       this.generatedImageUrl = `data:${mimeType};base64,${imageData}`;
       this.generatedImage.src = this.generatedImageUrl;
       this.generatedResults.classList.remove('hidden');
       this.hideEnhancedLoading();
       this.hideStatus();
       
       // Scroll to results
       this.generatedResults.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      // Generation error - silently handle
      let errorMessage = 'Generation failed: ';
      
      if (error.message.includes('API_KEY_INVALID')) {
        errorMessage += 'Invalid API key. Please check your Gemini API key.';
      } else if (error.message.includes('QUOTA_EXCEEDED')) {
        errorMessage += 'API quota exceeded. Please check your usage limits.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage += 'Network error. Please check your connection.';
      } else {
        errorMessage += error.message;
      }
      
      this.hideEnhancedLoading();
      this.showStatus(errorMessage);
      setTimeout(() => this.hideStatus(), 5000);
    } finally {
      this.generateBtn.disabled = false;
    }
  }

  async imageToBase64(imageSrc) {
    if (imageSrc.startsWith('data:')) {
      // Extract base64 data from data URL
      return imageSrc.split(',')[1];
    } else {
      // If it's a URL, fetch and convert to base64
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
      });
    }
  }

  async copyImageToClipboard() {
    if (!this.generatedImageUrl) {
      this.showStatus('No generated image to copy');
      return;
    }

    try {
      // Convert the image to blob
      const response = await fetch(this.generatedImageUrl);
      const blob = await response.blob();
      
      // Copy to clipboard using the Clipboard API
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
      this.showStatus('Image copied to clipboard!');
      setTimeout(() => this.hideStatus(), 2000);
    } catch (error) {
      // Failed to copy image - silently handle
      this.showStatus('Failed to copy image to clipboard');
      setTimeout(() => this.hideStatus(), 3000);
    }
  }

  openChatToEdit() {
    if (!this.generatedImageUrl) {
      this.showStatus('No generated image to edit');
      return;
    }

    // Show the chat interface
    this.chatInterface.classList.remove('hidden');
    this.chatInput.focus();
    
    // Scroll to chat interface
    this.chatInterface.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  closeChatInterface() {
    this.chatInterface.classList.add('hidden');
    this.chatGeneratedResults.classList.add('hidden');
  }
  
  async sendChatMessage() {
    const message = this.chatInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    this.addChatMessage(message, 'user');
    
    // Clear input and disable send button
    this.chatInput.value = '';
    this.sendChatBtn.disabled = true;
    
    // Show loading message
    const loadingMessageId = this.addChatMessage('Generating new image...', 'system', true);
    
    try {
      // Generate new image based on chat message
      await this.generateChatImage(message);
      
      // Remove loading message
      this.removeChatMessage(loadingMessageId);
      
      // Add success message
      this.addChatMessage('Here\'s your updated image!', 'system');
      
    } catch (error) {
      // Chat generation error - silently handle
      
      // Remove loading message
      this.removeChatMessage(loadingMessageId);
      
      // Add error message
      this.addChatMessage('Sorry, I couldn\'t generate the image. Please try again.', 'system');
    }
  }
  
  addChatMessage(content, type, isLoading = false) {
    const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}-message${isLoading ? ' loading' : ''}`;
    messageDiv.id = messageId;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (isLoading) {
      contentDiv.innerHTML = `
        <span>${content}</span>
        <div class="chat-loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      `;
    } else {
      contentDiv.innerHTML = `<p>${content}</p>`;
    }
    
    messageDiv.appendChild(contentDiv);
    this.chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    
    return messageId;
  }
  
  removeChatMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) {
      message.remove();
    }
  }
  
  async generateChatImage(userMessage) {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }
    
    try {
      // Convert current generated image to base64
      const currentImageBase64 = await this.imageToBase64(this.generatedImageUrl);
      
      // Build the system prompt for editing
      const systemPrompt = `You are an AI image editor. The user has provided an image and wants to make changes to it. Generate a new image based on their request while maintaining the overall style and quality of the original image.

User's editing request: "${userMessage}"

Please create a modified version that incorporates their requested changes while preserving the essence of the original image.`;
      
      const requestBody = {
        contents: [{
          parts: [
            { text: "ORIGINAL IMAGE (to be edited):" },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: currentImageBase64
              }
            },
            { text: systemPrompt }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096
        }
      };
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API Error: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const result = await response.json();
      
      // Check if the response contains candidates
      if (!result.candidates || result.candidates.length === 0) {
        throw new Error('No image generated');
      }
      
      const candidate = result.candidates[0];
      
      // Extract the generated image data by iterating through all parts
      let imageData = null;
      let mimeType = 'image/png';
      
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            imageData = part.inlineData.data;
            mimeType = part.inlineData.mimeType || 'image/png';
            break;
          }
        }
      }
      
      if (!imageData) {
        throw new Error('No image data in response');
      }
      
      // Display the generated image
      const imageUrl = `data:${mimeType};base64,${imageData}`;
      this.showChatGeneratedImage(imageUrl);
      
    } catch (error) {
      // Error generating chat image - silently handle
      throw error;
    }
  }
  
  showChatGeneratedImage(imageUrl) {
    this.chatGeneratedImage.src = imageUrl;
    this.chatGeneratedResults.classList.remove('hidden');
    
    // Store the new image URL
    this.chatImageUrl = imageUrl;
    
    // Scroll to show the result
    this.chatGeneratedResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  downloadChatImage() {
    if (!this.chatImageUrl) return;
    
    const link = document.createElement('a');
    link.href = this.chatImageUrl;
    link.download = `soul-ai-chat-edit-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  async regenerateChatImage() {
    // Get the last user message
    const userMessages = this.chatMessages.querySelectorAll('.user-message');
    if (userMessages.length === 0) return;
    
    const lastUserMessage = userMessages[userMessages.length - 1];
    const messageText = lastUserMessage.querySelector('.message-content p').textContent;
    
    // Show loading message
    const loadingMessageId = this.addChatMessage('Regenerating image...', 'system', true);
    
    try {
      await this.generateChatImage(messageText);
      this.removeChatMessage(loadingMessageId);
      this.addChatMessage('Here\'s your regenerated image!', 'system');
    } catch (error) {
      // Regeneration error - silently handle
      this.removeChatMessage(loadingMessageId);
      this.addChatMessage('Sorry, I couldn\'t regenerate the image. Please try again.', 'system');
    }
  }
  
  continueChatFromResult() {
    // Hide the result and focus on chat input
    this.chatGeneratedResults.classList.add('hidden');
    this.chatInput.focus();
    
    // Update the main generated image with the chat result
    if (this.chatImageUrl) {
      this.generatedImageUrl = this.chatImageUrl;
      this.generatedImage.src = this.chatImageUrl;
    }
  }
  
  async copyChatImageToClipboard() {
    if (!this.chatImageUrl) return;
    
    try {
      // Convert data URL to blob
      const response = await fetch(this.chatImageUrl);
      const blob = await response.blob();
      
      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      
      // Show success feedback
      this.showStatus('Image copied to clipboard!');
      setTimeout(() => this.hideStatus(), 2000);
      
    } catch (error) {
      // Error copying image to clipboard - silently handle
      this.showStatus('Failed to copy image to clipboard');
      setTimeout(() => this.hideStatus(), 2000);
    }
  }

  showStatus(message) {
    this.statusText.textContent = message;
    this.statusDisplay.classList.remove('hidden');
  }

  hideStatus() {
    this.statusDisplay.classList.add('hidden');
  }

  showEnhancedLoading() {
    const loadingState = document.getElementById('loadingState');
    const loadingTitle = document.getElementById('loadingTitle');
    const loadingText = document.getElementById('loadingText');
    
    if (loadingState) {
      loadingState.classList.remove('hidden');
    }
    
    // Animated loading messages
    const messages = [
      { title: 'Creating Magic', subtitle: 'Analyzing your creative vision...' },
      { title: 'AI at Work', subtitle: 'Transforming character placement...' },
      { title: 'Almost There', subtitle: 'Adding final touches...' },
      { title: 'Perfecting Details', subtitle: 'Enhancing lighting and composition...' }
    ];
    
    let messageIndex = 0;
    this.loadingInterval = setInterval(() => {
      if (loadingTitle && loadingText) {
        loadingTitle.textContent = messages[messageIndex].title;
        loadingText.textContent = messages[messageIndex].subtitle;
        messageIndex = (messageIndex + 1) % messages.length;
      }
    }, 2000);
  }

  hideEnhancedLoading() {
    const loadingState = document.getElementById('loadingState');
    
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
      this.loadingInterval = null;
    }
    
    if (loadingState) {
      loadingState.classList.add('hidden');
    }
  }

  downloadGeneratedImage() {
    if (!this.generatedImageUrl) {
      return;
    }

    const link = document.createElement('a');
    link.href = this.generatedImageUrl;
    link.download = `soul-ai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  async generateVideo() {
    if (!this.geminiApiKey || !this.falApiKey) {
      this.showStatus('Both Gemini and Fal API keys are required for video generation');
      return;
    }
    
    if (!this.generatedImageUrl) {
      this.showStatus('Please generate an image first');
      return;
    }
    
    try {
      // Show video loading state
      this.showVideoLoading();
      
      // Step 1: Generate video prompt using Gemini
      const videoPrompt = await this.generateVideoPrompt();
      
      // Step 2: Generate video using Fal API
      const videoUrl = await this.generateVideoWithFal(videoPrompt);
      
      // Show generated video
      this.showGeneratedVideo(videoUrl);
      
    } catch (error) {
      // Video generation error - silently handle
      this.showStatus('Failed to generate video. Please try again.');
      this.hideVideoLoading();
    }
  }
  
  async generateVideoPrompt() {
    const imageBase64 = await this.imageToBase64(this.generatedImageUrl);
    
    const prompt = `Analyze this generated image and create a cinematic video prompt that will make the person or character come alive in a 6-second video. The prompt should:

1. Describe natural movements that would make the character appear to be "going live"
2. Include environmental interactions (walking, gesturing, interacting with surroundings)
3. Add cinematic elements like camera movements or lighting changes
4. Keep the character's appearance and style consistent
5. Make it feel dynamic and engaging
6. Limit to 600 characters maximum

Focus on creating a prompt that would work well for image-to-video generation, making the scene feel alive and cinematic while maintaining the original character's essence.

Return only the video prompt, nothing else.`;
    
    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64.split(',')[1]
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.8,
        topK: 32,
        topP: 1,
        maxOutputTokens: 200
      }
    };
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated from Gemini');
    }
    
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Ensure the prompt is within 600 characters
    return generatedText.length > 600 
      ? generatedText.substring(0, 597) + '...'
      : generatedText;
  }
  
  async generateVideoWithFal(prompt) {
    // Use Fal's Seedance API (same as web app)
    // Generating video with Fal Seedance API
    // Request parameters logged for debugging
    
    const falResponse = await fetch('https://fal.run/fal-ai/bytedance/seedance/v1/lite/image-to-video', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${this.falApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: this.generatedImageUrl,
        prompt: prompt,
        duration: 6,
        resolution: '720p'
      })
    });
    
    if (!falResponse.ok) {
      const errorText = await falResponse.text();
      // Fal Seedance API error details
      throw new Error(`Fal Seedance API error: ${falResponse.status} - ${errorText}`);
    }
    
    const falData = await falResponse.json();
    // Fal Seedance API response received
    
    if (!falData.video || !falData.video.url) {
      throw new Error('No video URL returned from Fal Seedance API');
    }
    
    return falData.video.url;
  }
  
  showVideoLoading() {
    if (this.videoLoadingState) {
      this.videoLoadingState.classList.remove('hidden');
    }
    if (this.generatedVideoResults) {
      this.generatedVideoResults.classList.add('hidden');
    }
  }
  
  hideVideoLoading() {
    if (this.videoLoadingState) {
      this.videoLoadingState.classList.add('hidden');
    }
  }
  
  showGeneratedVideo(videoUrl) {
    this.hideVideoLoading();
    
    if (this.videoSource && this.generatedVideo && this.generatedVideoResults) {
      this.videoSource.src = videoUrl;
      this.generatedVideo.load();
      this.generatedVideoResults.classList.remove('hidden');
      this.generatedVideoUrl = videoUrl;
    }
  }
  
  downloadGeneratedVideo() {
    if (this.generatedVideoUrl) {
      const link = document.createElement('a');
      link.href = this.generatedVideoUrl;
      link.download = `soul-ai-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  
  async copyVideoToClipboard() {
    if (this.generatedVideoUrl) {
      try {
        await navigator.clipboard.writeText(this.generatedVideoUrl);
        if (this.copyVideoBtn) {
          const originalText = this.copyVideoBtn.innerHTML;
          this.copyVideoBtn.innerHTML = '✓ Copied!';
          this.copyVideoBtn.style.background = 'rgba(34, 197, 94, 0.2)';
          setTimeout(() => {
            this.copyVideoBtn.innerHTML = originalText;
            this.copyVideoBtn.style.background = '';
          }, 2000);
        }
      } catch (error) {
        // Failed to copy video URL - silently handle
        this.showStatus('Failed to copy video URL');
      }
    }
  }
}

// Initialize popup when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SoulAIPopup();
  });
} else {
  new SoulAIPopup();
}