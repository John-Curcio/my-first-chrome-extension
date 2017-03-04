/*
A BACKGROUND SCIRPT has access to every Chrome API but cannot access the
current page. Runs in the background of the browsing session, but can't do
things like log to the console (peculiar imo).
Content.js and background.js pass messages between each other.
*/
var clicks = 0;
// The following is called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
    // Send a message to the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        clicks++;
        var activeTab = tabs[0];
        // This sends an arbitrary JSON payload to the current tab.
        // Just chose "message" for simplicity
        chrome.tabs.sendMessage(activeTab.id,
          {"message": "clicked_browser_action",
          "iconClicks": clicks});
    });
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message == "open_new_tab" ) {
      chrome.tabs.create({"url": request.url});
    }
  }
);
