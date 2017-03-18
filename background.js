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
    console.log("clicked on the rainbow dildo.")
    // Send a message to the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        clicks++;
        var activeTab = tabs[0];
        // This sends an arbitrary JSON payload to the current tab.
        chrome.tabs.sendMessage(activeTab.id, {
            "message": "clicked_browser_action",
            "iconClicks": clicks});
    });
});

//gets an array of chrome history
chrome.tabs.onCreated.addListener(function() {
    console.log("created a new tab. ");
    var history = [];
    days = 1;
    startTime = days * 24 * 60 * 60 * 1000; //{days} days ago.
    chrome.history.search({'text': '', "startTime": startTime}, function(historyItems) {
        historyItems.forEach(function(item){
            history.push(item.url);
        });
        // Send a message to the active tab
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var activeTab = tabs[0];
            // This sends an arbitrary JSON payload to the current tab.
            chrome.tabs.sendMessage(activeTab.id, {
                "message": "new_tab_created",
                "history": history});
        });
    });
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message == "open_new_tab" ) {
      chrome.tabs.create({"url": request.url});
    }
  }
);
