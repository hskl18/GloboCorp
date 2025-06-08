/**
 * GloboCorp GPT Genie - Modern Chat Application
 * Author: Refactored from mlazze@globocorp.com
 * Version: 2.0
 *
 * Features:
 * - Modern ES6+ JavaScript
 * - Proper separation of concerns
 * - Configurable responses and settings
 * - Error handling and validation
 * - Accessibility support
 * - Performance optimizations
 */

// ===== CONFIGURATION (EASY TO MODIFY) =====
const CONFIG = {
  app: {
    name: "GloboCorp's GPT Genie",
    version: "2.0",
    author: "mlazze@globocorp.com",
  },

  chat: {
    maxMessageLength: 500,
    typingDelay: {
      min: 800,
      max: 2000,
    },
    responses: [
      "Your wish is my command! ✨",
      "That's an absolutely brilliant idea! 💡",
      "I can feel the magic in your words! 🌟",
      "What an incredible vision you have! 👁️",
      "The genie approves of this wish! 🧞‍♂️",
      "Your creativity knows no bounds! 🎨",
      "I'm impressed by your imagination! 💭",
      "That sounds like pure magic! ⚡",
      "Let me weave some magic around that idea! 🪄",
      "Your dreams are about to come true! 🌈",
      "I sense great potential in your wish! 🔮",
      "The universe is aligning with your vision! 🌌",
    ],
    errorMessages: {
      empty: "Please share your wish with the genie! ✨",
      tooLong: `Your wish is too long! Please keep it under ${500} characters. 📝`,
      network: "The genie is temporarily unavailable. Please try again! 🧞‍♂️",
    },
  },

  animation: {
    messageDelay: 50,
    scrollBehavior: "smooth",
  },
};

// ===== UTILITY FUNCTIONS =====
const Utils = {
  /**
   * Safely escape HTML to prevent XSS attacks
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Generate random delay for typing simulation
   */
  getRandomDelay() {
    const { min, max } = CONFIG.chat.typingDelay;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Get random response from configured responses
   */
  getRandomResponse() {
    const responses = CONFIG.chat.responses;
    return responses[Math.floor(Math.random() * responses.length)];
  },

  /**
   * Validate message input
   */
  validateMessage(message) {
    if (!message || message.trim().length === 0) {
      return { valid: false, error: CONFIG.chat.errorMessages.empty };
    }

    if (message.length > CONFIG.chat.maxMessageLength) {
      return { valid: false, error: CONFIG.chat.errorMessages.tooLong };
    }

    return { valid: true };
  },

  /**
   * Smooth scroll to bottom of chat
   */
  scrollToBottom(element) {
    element.scrollTo({
      top: element.scrollHeight,
      behavior: CONFIG.animation.scrollBehavior,
    });
  },

  /**
   * Focus element with error handling
   */
  focusElement(element) {
    try {
      element?.focus();
    } catch (error) {
      console.warn("Focus failed:", error);
    }
  },
};

// ===== CHAT APPLICATION CLASS =====
class GenieChat {
  constructor() {
    this.elements = this.initializeElements();
    this.state = {
      messageCount: 0,
      messages: [],
      isTyping: false,
      isFirstMessage: true,
    };

    this.initialize();
  }

  /**
   * Initialize and cache DOM elements
   */
  initializeElements() {
    const elements = {
      chatContainer: document.getElementById("chatContainer"),
      messageInput: document.getElementById("messageInput"),
      messageForm: document.getElementById("messageForm"),
      typingIndicator: document.getElementById("typingIndicator"),
      sendButton: document.querySelector(".send-button"),
    };

    // Validate all required elements exist
    for (const [key, element] of Object.entries(elements)) {
      if (!element) {
        throw new Error(`Required element not found: ${key}`);
      }
    }

    return elements;
  }

  /**
   * Initialize the application
   */
  initialize() {
    try {
      this.setupEventListeners();
      this.setupVersionInfo();
      this.focusInput();
      this.logAppStart();
    } catch (error) {
      console.error("Failed to initialize Genie Chat:", error);
      this.showError(
        "Failed to initialize the application. Please refresh the page."
      );
    }
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Form submission
    this.elements.messageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSendMessage();
    });

    // Input validation on typing
    this.elements.messageInput.addEventListener("input", (e) => {
      this.handleInputChange(e.target.value);
    });

    // Keyboard shortcuts
    this.elements.messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });

    // Window focus events
    window.addEventListener("focus", () => {
      this.focusInput();
    });
  }

  /**
   * Set up version information in footer
   */
  setupVersionInfo() {
    const appNameElement = document.querySelector(".app-name");
    const appVersionElement = document.querySelector(".app-version");

    if (appNameElement) {
      appNameElement.setAttribute("data-name", CONFIG.app.name);
    }

    if (appVersionElement) {
      appVersionElement.setAttribute("data-version", CONFIG.app.version);
    }
  }

  /**
   * Handle input changes for validation
   */
  handleInputChange(value) {
    // Real-time character count feedback could be added here
    if (value.length > CONFIG.chat.maxMessageLength) {
      this.elements.messageInput.classList.add("error");
    } else {
      this.elements.messageInput.classList.remove("error");
    }
  }

  /**
   * Handle sending a message
   */
  async handleSendMessage() {
    if (this.state.isTyping) {
      return; // Prevent sending while genie is typing
    }

    const message = this.elements.messageInput.value.trim();
    const validation = Utils.validateMessage(message);

    if (!validation.valid) {
      this.showError(validation.error);
      return;
    }

    try {
      // Disable input while processing
      this.setInputDisabled(true);

      // Add user message
      await this.addUserMessage(message);

      // Clear input
      this.elements.messageInput.value = "";

      // Simulate genie response
      await this.simulateGenieResponse();
    } catch (error) {
      console.error("Error sending message:", error);
      this.showError(CONFIG.chat.errorMessages.network);
    } finally {
      // Re-enable input
      this.setInputDisabled(false);
      this.focusInput();
    }
  }

  /**
   * Add user message to chat
   */
  async addUserMessage(message) {
    // Remove welcome message on first message
    if (this.state.isFirstMessage) {
      this.clearWelcomeMessage();
      this.state.isFirstMessage = false;
    }

    // Create message element
    const messageElement = this.createMessageElement(message, "user");

    // Add to chat with animation
    this.elements.chatContainer.appendChild(messageElement);

    // Update state
    this.state.messageCount++;
    this.state.messages.push({
      type: "user",
      content: message,
      timestamp: new Date(),
    });

    // Scroll to bottom
    await this.scrollToBottom();
  }

  /**
   * Simulate genie response
   */
  async simulateGenieResponse() {
    // Show typing indicator
    this.showTypingIndicator();
    this.state.isTyping = true;

    // Wait for random delay
    const delay = Utils.getRandomDelay();
    await this.wait(delay);

    // Hide typing indicator
    this.hideTypingIndicator();

    // Get and add response
    const response = Utils.getRandomResponse();
    await this.addGenieMessage(response);

    this.state.isTyping = false;
  }

  /**
   * Add genie message to chat
   */
  async addGenieMessage(message) {
    // Create message element
    const messageElement = this.createMessageElement(message, "genie");

    // Add to chat with animation
    this.elements.chatContainer.appendChild(messageElement);

    // Update state
    this.state.messages.push({
      type: "genie",
      content: message,
      timestamp: new Date(),
    });

    // Scroll to bottom
    await this.scrollToBottom();
  }

  /**
   * Create a message element
   */
  createMessageElement(message, type) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}-message`;
    messageDiv.setAttribute("role", "log");

    const bubbleDiv = document.createElement("div");
    bubbleDiv.className = `message-bubble ${type}-bubble`;
    bubbleDiv.innerHTML = Utils.escapeHtml(message);

    messageDiv.appendChild(bubbleDiv);
    return messageDiv;
  }

  /**
   * Show typing indicator
   */
  showTypingIndicator() {
    this.elements.typingIndicator.style.display = "flex";
    this.elements.typingIndicator.setAttribute("aria-hidden", "false");
  }

  /**
   * Hide typing indicator
   */
  hideTypingIndicator() {
    this.elements.typingIndicator.style.display = "none";
    this.elements.typingIndicator.setAttribute("aria-hidden", "true");
  }

  /**
   * Clear welcome message
   */
  clearWelcomeMessage() {
    const welcomeMessage =
      this.elements.chatContainer.querySelector(".welcome-message");
    if (welcomeMessage) {
      welcomeMessage.remove();
    }
  }

  /**
   * Enable/disable input controls
   */
  setInputDisabled(disabled) {
    this.elements.messageInput.disabled = disabled;
    this.elements.sendButton.disabled = disabled;
  }

  /**
   * Focus the input field
   */
  focusInput() {
    Utils.focusElement(this.elements.messageInput);
  }

  /**
   * Scroll chat to bottom
   */
  async scrollToBottom() {
    // Small delay to ensure DOM is updated
    await this.wait(CONFIG.animation.messageDelay);
    Utils.scrollToBottom(this.elements.chatContainer);
  }

  /**
   * Show error message
   */
  showError(message) {
    // Simple error display - could be enhanced with toast notifications
    console.warn("Chat Error:", message);

    // For now, just focus input and potentially show in UI
    this.focusInput();

    // Could add visual error indication here
    this.elements.messageInput.placeholder = message;
    setTimeout(() => {
      this.elements.messageInput.placeholder = "Type your wish here...";
    }, 3000);
  }

  /**
   * Utility function to wait/delay
   */
  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Log application start
   */
  logAppStart() {
    console.log(
      `${CONFIG.app.name} v${CONFIG.app.version} loaded @ ${new Date()}`
    );
    console.log(`Created by ${CONFIG.app.author}`);
  }

  /**
   * Get current state (useful for debugging)
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Clear chat history
   */
  clearChat() {
    this.elements.chatContainer.innerHTML =
      '<div class="welcome-message"><p>Welcome! Start a conversation by typing your message below...</p></div>';
    this.state.messages = [];
    this.state.messageCount = 0;
    this.state.isFirstMessage = true;
  }
}

// ===== APPLICATION INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
  try {
    // Initialize the application
    window.genieChat = new GenieChat();

    // Expose utilities for debugging (can be removed in production)
    if (process?.env?.NODE_ENV === "development") {
      window.GenieUtils = Utils;
      window.GenieConfig = CONFIG;
    }
  } catch (error) {
    console.error("Failed to start Genie Chat application:", error);

    // Fallback error display
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        text-align: center;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      ">
        <h1 style="color: #2563eb; margin-bottom: 16px;">⚠️ Application Error</h1>
        <p style="color: #64748b; margin-bottom: 24px;">
          The Genie application failed to start. Please refresh the page or contact support.
        </p>
        <button onclick="window.location.reload()" style="
          background: #2563eb;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
        ">
          Refresh Page
        </button>
      </div>
    `;
  }
});

// ===== EXPORT FOR MODULES (IF NEEDED) =====
if (typeof module !== "undefined" && module.exports) {
  module.exports = { GenieChat, Utils, CONFIG };
}
