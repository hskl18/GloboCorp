/**
 * GloboCorp GPT Genie - Main Application Logic
 *
 * Modern, maintainable JavaScript implementation with proper error handling,
 * accessibility support, and clean architecture.
 *
 * @author Refactored by Development Team
 * @version 2.0
 */

class GlobocorpGenie {
  constructor() {
    // Ensure config is loaded
    if (!window.GenieConfig) {
      console.error(
        "GenieConfig not found. Please ensure config.js is loaded first."
      );
      return;
    }

    this.config = window.GenieConfig;
    this.messageHistory = [];
    this.isProcessing = false;

    // Initialize the application
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    try {
      this.cacheElements();
      this.bindEvents();
      this.loadMessageHistory();
      this.logInitialization();
    } catch (error) {
      this.handleError("Failed to initialize application", error);
    }
  }

  /**
   * Cache DOM elements for better performance
   */
  cacheElements() {
    this.elements = {
      chatWindow: document.getElementById("chatWindow"),
      messageForm: document.getElementById("messageForm"),
      messageInput: document.getElementById("messageInput"),
    };

    // Cache send button after form is available
    if (this.elements.messageForm) {
      this.elements.sendButton =
        this.elements.messageForm.querySelector(".send-button");
    }

    // Validate required elements
    const requiredElements = ["chatWindow", "messageForm", "messageInput"];
    const missingElements = requiredElements.filter(
      (key) => !this.elements[key]
    );

    if (missingElements.length > 0) {
      throw new Error(
        `Missing required elements: ${missingElements.join(", ")}`
      );
    }
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Form submission
    this.elements.messageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSendMessage();
    });

    // Input field enhancements
    this.elements.messageInput.addEventListener("input", () => {
      this.handleInputChange();
    });

    // Keyboard shortcuts (if enabled)
    if (this.config.features.enableKeyboardShortcuts) {
      this.bindKeyboardShortcuts();
    }

    // Handle accessibility preferences
    this.handleAccessibilityPreferences();
  }

  /**
   * Handle keyboard shortcuts
   */
  bindKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Ctrl/Cmd + Enter to send message
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        this.handleSendMessage();
      }

      // Escape to clear input
      if (
        e.key === "Escape" &&
        document.activeElement === this.elements.messageInput
      ) {
        this.elements.messageInput.value = "";
      }
    });
  }

  /**
   * Handle accessibility preferences
   */
  handleAccessibilityPreferences() {
    // Check for reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.config.accessibility.reducedMotion = true;
      this.config.features.enableAnimations = false;
    }

    // Check for high contrast preference
    if (window.matchMedia("(prefers-contrast: high)").matches) {
      this.config.accessibility.highContrastMode = true;
    }
  }

  /**
   * Handle input field changes
   */
  handleInputChange() {
    const input = this.elements.messageInput;
    const button = this.elements.sendButton;

    if (button) {
      button.disabled = input.value.trim().length === 0 || this.isProcessing;
    }
  }

  /**
   * Handle sending a message
   */
  async handleSendMessage() {
    const messageText = this.elements.messageInput.value.trim();

    // Validation
    if (!this.validateMessage(messageText)) {
      return;
    }

    // Prevent multiple submissions
    if (this.isProcessing) {
      return;
    }

    try {
      this.isProcessing = true;
      this.updateUIState(true);

      // Add user message
      this.addMessage(messageText, "user");

      // Clear input
      this.elements.messageInput.value = "";

      // Get and display genie response
      await this.processGenieResponse(messageText);
    } catch (error) {
      this.handleError("Failed to send message", error);
      this.addMessage(this.config.messages.errorNetwork, "genie");
    } finally {
      this.isProcessing = false;
      this.updateUIState(false);
    }
  }

  /**
   * Validate message input
   */
  validateMessage(message) {
    if (!message) {
      this.showError(this.config.messages.errorEmpty);
      this.elements.messageInput.focus();
      return false;
    }

    if (message.length > this.config.ui.maxMessageLength) {
      this.showError(
        `Message too long. Maximum ${this.config.ui.maxMessageLength} characters allowed.`
      );
      return false;
    }

    return true;
  }

  /**
   * Process genie response
   */
  async processGenieResponse(userMessage) {
    // Show typing indicator if enabled
    if (this.config.ui.showTypingIndicator) {
      this.showTypingIndicator();
    }

    // Simulate API delay
    const delay = this.getRandomDelay();
    await this.sleep(delay);

    // Hide typing indicator
    this.hideTypingIndicator();

    // Get response
    const response = this.generateResponse(userMessage);

    // Add genie message
    this.addMessage(response, "genie");
  }

  /**
   * Generate genie response
   */
  generateResponse(userMessage) {
    // In a real implementation, this would call an API
    if (this.config.development.mockResponses) {
      const responses = this.config.responses.replies;
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Placeholder for real API integration
    return "I'm not connected to the real genie API yet!";
  }

  /**
   * Add a message to the chat
   */
  addMessage(text, sender) {
    const messageElement = this.createMessageElement(text, sender);

    // Add to chat window
    this.elements.chatWindow.appendChild(messageElement);

    // Add to history
    this.messageHistory.push({ text, sender, timestamp: new Date() });

    // Manage message limit
    this.enforceMessageLimit();

    // Auto-scroll
    if (this.config.ui.autoScroll) {
      this.scrollToBottom();
    }

    // Announce to screen readers
    if (this.config.accessibility.announceMessages && sender === "genie") {
      this.announceToScreenReader(text);
    }

    // Save to storage if enabled
    if (this.config.features.enableMessageHistory) {
      this.saveMessageHistory();
    }
  }

  /**
   * Create message DOM element
   */
  createMessageElement(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}-message`;

    if (
      this.config.features.enableAnimations &&
      !this.config.accessibility.reducedMotion
    ) {
      messageDiv.style.opacity = "0";
      messageDiv.style.transform = "translateY(10px)";
    }

    const labelDiv = document.createElement("div");
    labelDiv.className = "message-label";
    labelDiv.textContent =
      sender === "genie"
        ? this.config.messages.labels.genie
        : this.config.messages.labels.user;

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    contentDiv.textContent = this.sanitizeText(text);

    messageDiv.appendChild(labelDiv);
    messageDiv.appendChild(contentDiv);

    // Animate in if animations are enabled
    if (
      this.config.features.enableAnimations &&
      !this.config.accessibility.reducedMotion
    ) {
      requestAnimationFrame(() => {
        messageDiv.style.transition = `all ${this.config.ui.animationDuration}ms ease`;
        messageDiv.style.opacity = "1";
        messageDiv.style.transform = "translateY(0)";
      });
    }

    return messageDiv;
  }

  /**
   * Show typing indicator
   */
  showTypingIndicator() {
    this.typingIndicator = this.createMessageElement(
      this.config.messages.processing,
      "genie"
    );
    this.typingIndicator.classList.add("typing-indicator");
    this.elements.chatWindow.appendChild(this.typingIndicator);
    this.scrollToBottom();
  }

  /**
   * Hide typing indicator
   */
  hideTypingIndicator() {
    if (this.typingIndicator) {
      this.typingIndicator.remove();
      this.typingIndicator = null;
    }
  }

  /**
   * Update UI state during processing
   */
  updateUIState(processing) {
    const button = this.elements.sendButton;
    const input = this.elements.messageInput;

    if (button) {
      button.disabled = processing || input.value.trim().length === 0;
      button.textContent = processing ? "Sending..." : "Send";
    }

    input.disabled = processing;
  }

  /**
   * Scroll chat to bottom
   */
  scrollToBottom() {
    if (this.elements.chatWindow) {
      this.elements.chatWindow.scrollTop =
        this.elements.chatWindow.scrollHeight;
    }
  }

  /**
   * Announce message to screen readers
   */
  announceToScreenReader(text) {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "visually-hidden";
    announcement.textContent = `Genie says: ${text}`;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Enforce message limit to prevent memory issues
   */
  enforceMessageLimit() {
    const messages = this.elements.chatWindow.querySelectorAll(
      ".message:not(.typing-indicator)"
    );
    const limit = this.config.ui.messageLimit;

    if (messages.length > limit) {
      const excess = messages.length - limit;
      for (let i = 0; i < excess; i++) {
        if (!messages[i].classList.contains("welcome-message")) {
          messages[i].remove();
        }
      }

      // Also trim history
      this.messageHistory = this.messageHistory.slice(-limit);
    }
  }

  /**
   * Load message history from storage
   */
  loadMessageHistory() {
    if (!this.config.features.enableMessageHistory) return;

    try {
      const stored = localStorage.getItem("genie-message-history");
      if (stored) {
        this.messageHistory = JSON.parse(stored);
        this.log("Message history loaded");
      }
    } catch (error) {
      this.log("Failed to load message history:", error);
    }
  }

  /**
   * Save message history to storage
   */
  saveMessageHistory() {
    if (!this.config.features.enableMessageHistory) return;

    try {
      const toStore = this.messageHistory.slice(-50); // Keep last 50 messages
      localStorage.setItem("genie-message-history", JSON.stringify(toStore));
    } catch (error) {
      this.log("Failed to save message history:", error);
    }
  }

  /**
   * Utility Methods
   */

  /**
   * Get random delay for response simulation
   */
  getRandomDelay() {
    const { min, max } = this.config.responses.delay;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Sanitize text to prevent XSS
   */
  sanitizeText(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.textContent || div.innerText || "";
  }

  /**
   * Show error message
   */
  showError(message) {
    // Simple alert for now - could be enhanced with a custom modal
    alert(message);
  }

  /**
   * Handle errors gracefully
   */
  handleError(message, error) {
    this.log(`Error: ${message}`, error);

    if (this.config.development.debugMode) {
      console.error(message, error);
    }
  }

  /**
   * Logging utility
   */
  log(...args) {
    if (this.config.development.enableLogging) {
      console.log(`[${this.config.app.name}]`, ...args);
    }
  }

  /**
   * Log successful initialization
   */
  logInitialization() {
    this.log(
      `v${
        this.config.app.version
      } initialized successfully at ${new Date().toLocaleTimeString()}`
    );

    if (this.config.development.debugMode) {
      this.log("Debug mode enabled");
      this.log("Configuration:", this.config);
    }
  }
}

// Initialize the application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Check if GenieConfig is available
  if (!window.GenieConfig) {
    console.error("GenieConfig not found. Application cannot start.");
    return;
  }

  // Initialize the genie application
  window.genieApp = new GlobocorpGenie();
});

// Export for potential use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = GlobocorpGenie;
}
