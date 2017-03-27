/*
A BACKGROUND SCIRPT has access to every Chrome API but cannot access the
current page. Runs in the background of the browsing session, but can't do
things like log to the console (peculiar imo).
Content.js and background.js pass messages between each other.
*/

// initialize Firebase
var config = {
    apiKey: "AIzaSyAgiLcOrieofT51GNC8Ue6XKMQRduMbF-4",
    authDomain: "my-first-chrome-extension.firebaseapp.com",
    databaseURL: "https://my-first-chrome-extension.firebaseio.com",
    storageBucket: "my-first-chrome-extension.appspot.com",
    messagingSenderId: "788900853858"
};
firebase.initializeApp(config);


// counting # times clicked is just for me to debug - not actually useful
var clicks = 0;
// The following is called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
    console.log("clicked on the rainbow dildo.");
    // Send a message to the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        clicks++;
        var activeTab = tabs[0];
        // This sends an arbitrary JSON payload to the current tab.
        chrome.tabs.sendMessage(activeTab.id, {
            "message": "clicked_browser_action",
            "iconClicks": clicks});
    });

    //TODO tell the firebase database that i just clicked on the rainbow dildo.
    var ref = firebase.ref("tests");
    var data = {
        "test": true,
        "clicks":clicks
    };
    ref.push(data);

});

//gets an array of chrome history
chrome.tabs.onCreated.addListener(function() {
    console.log("created a new tab. ");
    var history = [];
    days = 10;
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
