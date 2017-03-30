/*
A BACKGROUND SCIRPT has access to every Chrome API but cannot access the
current page. Runs in the background of the browsing session, but can't do
things like log to the console (peculiar imo).
Content.js and background.js pass messages between each other.
*/
// Initialize Firebase
var config = {
    apiKey: "AIzaSyAgiLcOrieofT51GNC8Ue6XKMQRduMbF-4",
    authDomain: "my-first-chrome-extension.firebaseapp.com",
    databaseURL: "https://my-first-chrome-extension.firebaseio.com",
    storageBucket: "my-first-chrome-extension.appspot.com",
    messagingSenderId: "788900853858"
};
firebase.initializeApp(config);
// Get a reference to the database service
var database = firebase.database();
// Authorization / identification
const auth = firebase.auth();
// This gets called both at startup and when the Auth state is changed
// (i.e. signing in or out)
// TODO: initialize the user's tabSessions and initialHistory objects in here!
auth.onAuthStateChanged(function(user){
    if(user){
        console.log("okay, signed in now");
        console.log(user.uid);
    } else {
        console.log("looks like it was signed out");
        auth.signInAnonymously().catch(function(error){
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
        });
        console.log(auth.currentUser.uid);
        // initialize the currentUser.id object in the database,
        // populate it with the last few days' or weeks' worth of data.
        var d = new Date(); //milliseconds since epoch
        days = 10;
        currTime = d.getTime();
        startTime = currTime - days * 24 * 60 * 60 * 1000; //milliseconds since epoch
        logInitialHistory(auth.currentUser.uid, startTime);
        console.log("should've logged initial history by now.");
    }
});

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
    //tells the firebase database that i just clicked on the rainbow dildo.
    // firebase.database().ref('users/' + auth.currentUser.uid).push({
    //   "tests": true,
    //   "clicks": clicks,
    //   "time": Date.now()
    // });
    //prints to console the current values in tests
});

//TODO: this should only be for if the created tab is an empty, new tab page.
//gets an array of chrome history
chrome.tabs.onCreated.addListener(function() {
    var history = [];
    var d = new Date();
    days = 1;
    currTime = d.getTime();
    startTime = currTime - days * 24 * 60 * 60 * 1000; //{days} days ago.
    chrome.history.search({'text': '', "startTime": startTime, "endTime":d.getTime()}, function(historyItems) {
        var parser = null;
        historyItems.forEach(function(item){
            parser = document.createElement('a');
            parser.href = item.url;
            daysSinceLastVisit = (currTime - item.lastVisitTime) / (24 * 60 * 60 * 1000);
            history.push([parser.hostname, daysSinceLastVisit]);
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

// uploads the user's browser data since startTime to the database.
function logInitialHistory(userID, startTime){
    firebase.database().ref('users/' + userID).set({
        "initialHistory":null
    });
    chrome.history.search({'text': '', "startTime": startTime, "endTime":Date.now()}, function(historyItems) {
        var parser = null;
        historyItems.forEach(function(item){
            parser = document.createElement('a');
            parser.href = item.url;
            firebase.database().ref('users/' + auth.currentUser.uid).push({
              "hostname": parser.hostname,
              "lastVisitTime": item.lastVisitTime,
            });
            console.log(parser.hostname, item.lastVisitTime);
        });
    });
    console.log("logged initial history okay");
}

function getHostName(item){
    var parser = document.createElement('a');
    parser.href = item.url;
    return parser.hostname;
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        if (tab.status === "complete" && tab.active) {
            chrome.windows.get(tab.windowId, {populate: false}, function(window) {
                if (window.focused) {
                    parser = document.createElement('a');
                    parser.href = tab.url;
                    firebase.database().ref('users/' + auth.currentUser.uid).push({
                      "hostname": parser.hostname,
                      "visitTime": Date.now()
                    });
                }
            });
        }
    });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.active) {
        chrome.windows.get(tab.windowId, {populate: false}, function(window) {
            if (window.focused) {
                parser = document.createElement('a');
                parser.href = tab.url;
                firebase.database().ref('users/' + auth.currentUser.uid).push({
                  "hostname": parser.hostname,
                  "visitTime": Date.now()
                });
            }
        });
    }
});

chrome.windows.onFocusChanged.addListener(function (windowId) {
    if (windowId == chrome.windows.WINDOW_ID_NONE) {
        firebase.database().ref('users/' + auth.currentUser.uid).push({
          "hostname": "WINDOW_ID_NONE",
          "visitTime": Date.now()
        });
    } else {
        chrome.windows.get(windowId, {populate: true}, function(window) {
            if (window.focused) {
                chrome.tabs.query({active: true, windowId: windowId}, function (tabs) {
                    if (tabs[0].status === "complete") {
                        parser = document.createElement('a');
                        parser.href = tabs[0].url; //TODO does this work? i have no idea.
                        firebase.database().ref('users/' + auth.currentUser.uid).push({
                          "hostname": parser.hostname,
                          "visitTime": Date.now()
                        });
                    }
                });
            }
        });
    }
});
