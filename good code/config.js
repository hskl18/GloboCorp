/**
 * GloboCorp GPT Genie Configuration
 *
 * This file contains all configurable settings for the application.
 * Modify these values to customize the app behavior, messages, and branding.
 *
 * @author Refactored by Development Team
 * @version 2.0
 */

const GenieConfig = {
  // Application Metadata
  app: {
    name: "GloboCorp GPT Genie",
    version: "2.0",
    description: "Your AI-powered wish fulfillment assistant",
  },

  // UI Text Content (Easy to modify for different languages or branding)
  messages: {
    welcome: "Hello! I'm the Globocorp Genie. Your wish is my command!",
    placeholder: "What are your wishes mighty customer?",
    errorEmpty: "Please enter a message before sending!",
    errorNetwork:
      "Sorry, I'm having trouble connecting right now. Please try again.",
    jsDisabled:
      "This application requires JavaScript to function properly. Please enable JavaScript in your browser to use the GloboCorp GPT Genie.",
    processing: "Genie is thinking...",
    labels: {
      genie: "GENIE",
      user: "YOU",
    },
  },

  // Genie Response Configuration
  responses: {
    // Simulated responses for demo purposes
    // In a real implementation, this would be replaced with API calls
    replies: [
      "Presto...100 points!",
      "Your wish is granted! ✨",
      "Abracadabra! Consider it done!",
      "By the power of GloboCorp, it shall be so!",
      "Wish granted with corporate efficiency!",
      "Magic is happening behind the scenes!",
      "The GloboCorp magic is working!",
      "Your request has been processed successfully!",
      "Behold! Your wish comes true!",
      "The corporate genie delivers!",
    ],
    // Response delay in milliseconds
    delay: {
      min: 800,
      max: 2000,
    },
  },

  // UI Behavior Settings
  ui: {
    maxMessageLength: 500,
    autoScroll: true,
    showTypingIndicator: true,
    animationDuration: 300,
    messageLimit: 100, // Prevent memory issues in long conversations
  },

  // Feature Flags (Easy to enable/disable features)
  features: {
    enableAnimations: true,
    enableSoundEffects: false,
    enableKeyboardShortcuts: true,
    enableMessageHistory: true,
    enableAutoSave: false,
  },

  // Accessibility Settings
  accessibility: {
    announceMessages: true,
    highContrastMode: false,
    reducedMotion: false,
  },

  // Development Settings
  development: {
    enableLogging: true,
    debugMode: false,
    mockResponses: true, // Set to false when connecting to real API
  },
};

// Make config globally available
window.GenieConfig = GenieConfig;

// Optional: Validate configuration on load
if (GenieConfig.development.enableLogging) {
  console.log(
    `${GenieConfig.app.name} v${GenieConfig.app.version} - Configuration loaded`
  );
  console.log("Configuration:", GenieConfig);
}
