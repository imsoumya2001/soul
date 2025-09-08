// Chat Editor for Euphoria AI
class ChatEditor {
  constructor() {
    this.GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent';
    this.apiKey = null;
    this.currentImage = null;
    this.referenceImage = null;
    this.characterImage = null;
    
    this.initializeElements();
    this.loadFromParams();
    this.attachEventListeners();
  }

  initializeElements() {
    this.currentImageEl = document.getElementById('currentImage');
    this.chatMessages = document.getElementById('chatMessages');
    this.messageInput = document.getElementById('messageInput');
    this.sendBtn = document.getElementById('sendBtn');
  }

  loadFromParams() {
    const params = new URLSearchParams(window.location.search);
    this.currentImage = params.get('image');
    this.apiKey = params.get('apiKey');
    this.referenceImage = params.get('referenceImage');
    this.characterImage = params.get('characterImage');

    if (this.currentImage) {
      this.currentImageEl.src = this.currentImage;
    }
  }

  attachEventListeners() {
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    this.messageInput.addEventListener('input', () => {
      this.messageInput.style.height = 'auto';
      this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    });
  }

  async sendMessage() {
    const message = this.messageInput.value.trim();
    if (!message || !this.apiKey) return;

    // Add user message
    this.addMessage(message, 'user');
    this.messageInput.value = '';
    this.messageInput.style.height = 'auto';
    
    // Disable send button
    this.sendBtn.disabled = true;
    this.sendBtn.textContent = 'Processing...';

    try {
      // Generate new image based on edit request
      const response = await this.generateEditedImage(message);
      
      if (response && response.candidates && response.candidates[0]) {
        const content = response.candidates[0].content;
        if (content.parts && content.parts[0] && content.parts[0].inlineData) {
          const newImageData = content.parts[0].inlineData.data;
          const newImageUrl = `data:image/jpeg;base64,${newImageData}`;
          
          // Update current image
          this.currentImage = newImageUrl;
          this.currentImageEl.src = newImageUrl;
          
          this.addMessage('I\'ve updated the image based on your request!', 'assistant');
        } else {
          this.addMessage('I understand your request, but I couldn\'t generate a new image. Please try rephrasing your edit request.', 'assistant');
        }
      } else {
        this.addMessage('Sorry, I couldn\'t process your edit request. Please try again.', 'assistant');
      }
    } catch (error) {
      // Error generating edited image - silently handle
      this.addMessage('Sorry, there was an error processing your request. Please try again.', 'assistant');
    }

    // Re-enable send button
    this.sendBtn.disabled = false;
    this.sendBtn.textContent = 'Send';
  }

  async generateEditedImage(editRequest) {
    if (!this.currentImage) {
      throw new Error('No current image available');
    }

    const prompt = `You are an AI image editor. The user wants to edit the current generated image with this request: "${editRequest}"

Please generate a new version of the image that incorporates the requested changes while maintaining the overall style and quality.

Edit request: ${editRequest}`;

    const imageData = await this.imageToBase64(this.currentImage);
    
    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageData
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      }
    };

    const response = await fetch(`${this.GEMINI_API_URL}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
  }

  async imageToBase64(imageSrc) {
    return new Promise((resolve, reject) => {
      if (imageSrc.startsWith('data:')) {
        // Already base64
        const base64Data = imageSrc.split(',')[1];
        resolve(base64Data);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const base64Data = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
        resolve(base64Data);
      };
      img.onerror = reject;
      img.src = imageSrc;
    });
  }

  addMessage(text, sender) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${sender}`;
    messageEl.textContent = text;
    this.chatMessages.appendChild(messageEl);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ChatEditor();
  });
} else {
  new ChatEditor();
}