
/// <reference types="chrome"/>
// Basic background script for Chrome Extension (Manifest V3)
chrome.runtime.onInstalled.addListener(() => {
  console.log("Trader Behavioral Insights Extension Installed");
});

// Utility: Example message listener for content/background communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PING") {
    sendResponse({ type: "PONG", message: "Background received PING" });
  }
  // ...add more message handlers as needed
  return true; // Indicates async response allowed
});
