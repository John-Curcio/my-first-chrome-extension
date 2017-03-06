/*
A BACKGROUND SCIRPT has access to every Chrome API but cannot access the
current page. Runs in the background of the browsing session, but can't do
things like log to the console (peculiar imo).
Content.js and background.js pass messages between each other.
*/

// counting # times clicked is just for me to debug - not actually useful
var clicks = 0;
// The following is called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
    // create an array of the last 10 webpages visited
    var pageHistory = [];
    chrome.history.search({'text': '', "maxResults": 10}, function(historyItems) {
        historyItems.forEach(function(item){
            pageHistory.push(item.url);
        });
    });
    // Send a message to the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        clicks++;
        var activeTab = tabs[0];
        // This sends an arbitrary JSON payload to the current tab.
        chrome.tabs.sendMessage(activeTab.id, {
            "message": "clicked_browser_action",
            "iconClicks": clicks,
            "pageHistory": pageHistory});
    });
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message == "open_new_tab" ) {
      chrome.tabs.create({"url": request.url});
    }
  }
);
