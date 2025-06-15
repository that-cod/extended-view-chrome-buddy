
// Content script placeholder for extension (Manifest V3)
// This will run in the context of all web pages (per manifest).
console.log("Trader Behavioral Insights content script loaded");

// Example: Send a PING message to background for testing basic connectivity
chrome.runtime.sendMessage({ type: "PING" }, (response) => {
  if (response?.type === "PONG") {
    console.log("Content received PONG:", response.message);
  }
});
