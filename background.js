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
auth.onAuthStateChanged(function(user){
    if(user){
        console.log("okay, signed in now");
        console.log(user.uid);
    } else {
        console.log("looks like I was signed out");
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
});

function getTraffic(hostname, historyObj){
    return historyObj[hostname].traffic;
    // var traffic = 0.0;
    // for(i = 0; i < historyObj[hostname].length; i++){
    //     traffic += historyObj[hostname][i];
    // }
    // return traffic;
}

function merge(A, B, getValue, getValueArgs){
    var iters = 0;
    var C = [];
    var i = 0;
    var j = 0;
    while((i < A.length) || (j < B.length)){
        if((j == B.length) || (i < A.length &&
            (getValue(A[i], getValueArgs) <= getValue(B[j], getValueArgs)))){
            C.push(A[i]);
            i++;
        } else {
            C.push(B[j]);
            j++;
        }
        iters++;
        if(iters > A.length + B.length){return null;}
    }
    return C;
}

function mergesort(L, getValue, getValueArgs){
    if(L.length < 2){
        return L;
    } else {
        var mid = Math.floor(L.length / 2);
        var left = mergesort(L.slice(0, mid), getValue, getValueArgs);
        var right = mergesort(L.slice(mid, L.length), getValue, getValueArgs);
        return merge(left, right, getValue, getValueArgs);
    }
}

//Note that this is also where unnecessary elements of the queue get deleted.
//TODO: break it up into bins - what if there's overlap? What if somebody
//spends 3 hrs on reddit the bin size is 1 hour?
function sendSummaryToCurrentTab(){
    chrome.storage.local.get("queue", function(result){
        if(!("queue" in result)){
            result.queue = [];
            chrome.storage.local.set({"queue": result.queue}, function(){
                console.log("should have updated the queue successfully");
            });
        }
        console.log(result);
        var timeCutOff = 5 * 60 * 1000; //yes, five minutes.
        var binLength = 30 * 1000; //30 seconds.
        var historyObj = {};
        var newQueue = [];
        var numBins = Math.floor(timeCutOff / binLength);
        while(result.queue.length > 0){
            var x = result.queue.shift();
            if(x.end - Date.now() > timeCutOff){
                result.queue = [];
            } else {
                newQueue.push(x);
                if(!(x.hostname in historyObj)){
                    historyObj[x.hostname] = {
                        "visitLengths":[],
                        "traffic":0
                    };
                }
                console.log(x.hostname);
                console.log(x.end);
                console.log(x.start);
                console.log(x.end - x.start);
                historyObj[x.hostname].visitLengths.push(x.end - x.start);
                historyObj[x.hostname].traffic += x.end - x.start;
            }
        }
        chrome.storage.local.set({"queue": newQueue}, function(){
            // console.log("should have updated the queue successfully in sendSummaryToCurrentTab");
            console.log(newQueue);
        });
        console.log(historyObj);
        var hostnamesbytraffic = mergesort(Object.keys(historyObj),
                                            getTraffic, historyObj);
        console.log(historyObj);
        // Send a message to the active tab
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var activeTab = tabs[0];
            // This sends an arbitrary JSON payload to the current tab.
            chrome.tabs.sendMessage(activeTab.id, {
                "message": "newtab_page",
                "history": historyObj,
                "hostnamesbytraffic": hostnamesbytraffic
            });
        });

    });
}

//generates the new tab page
// chrome.tabs.onCreated.addListener(function() {
//     console.log("calling chrome.tabs.onCreated Listener");
//     console.log(window.location.href);
//     chrome.tabs.getCurrent(function(tab){
//         console.log(tab.url);
//         //this seems weird, but hey, it's simple and works
//         if(tab.url === "chrome://newtab/"){
//             sendSummaryToCurrentTab();
//         }
//     });
// });

chrome.runtime.onMessage.addListener(function(request, sender, senderResponse){
    console.log(sender.tab ?
        "from a content script:" + sender.tab.url :
        "from the extension");
    if(request.message == "newtab_page" && sender.tab.url == "chrome://newtab/"){
        sendSummaryToCurrentTab();
    }
});

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     console.log(sender.tab ?
//                 "from a content script:" + sender.tab.url :
//                 "from the extension");
//     if (request.greeting == "hello")
//       sendResponse({farewell: "goodbye"});});

function logOnlyEndTime(){
    chrome.storage.local.get("queue", function(result){
        var x = result.queue.pop();
        x.end = Date.now();
        result.queue.add(x);
    });
}

function initQueue(){
    var queue = [];
    queue.add = queue.push;
    queue.remove = queue.shift;
    //peek returns the first item in queue, without modifying queue
    queue.peek = function(){
        return queue[0];
    };
    return queue;
}

function log(item){
    // logs to the remote database
    var parser = document.createElement('a');
    parser.href = item.url;
    firebase.database().ref('users/' + auth.currentUser.uid).push({
      "hostname": parser.hostname,
      "visitTime": Date.now()
    });
    var hostname = parser.hostname;
    chrome.storage.local.get("queue", function(result){
        if(!result.queue){
            console.log(result);
            console.log(result.queue);
            console.log("key not recognized");
            result.queue = [];
        } else {
            var x = result.queue.pop();
            x.end = Date.now();
            result.queue.push(x);
        }
        if(parser.hostname != "newtab"){
            result.queue.push({
                "hostname": parser.hostname,
                "start": Date.now()});
        }
        chrome.storage.local.set({"queue": result.queue}, function(){
            console.log("should have updated the queue successfully");
        });
    });
}

// uploads the user's browser data since startTime to the database.
function logInitialHistory(userID, startTime){
    firebase.database().ref('users/' + userID).set({
        "initialHistory":null
    });
    chrome.history.search({'text': '', "startTime": startTime,
                        "endTime":Date.now()}, function(historyItems) {
        historyItems.forEach(function(item){
            var parser = document.createElement('a');
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
                    log(tab);
                    // var parser = document.createElement('a');
                    // parser.href = tab.url;
                    // firebase.database().ref('users/' + auth.currentUser.uid).push({
                    //   "hostname": parser.hostname,
                    //   "visitTime": Date.now()
                    // });
                }
            });
        }
    });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.active) {
        chrome.windows.get(tab.windowId, {populate: false}, function(window) {
            if (window.focused) {
                log(tab);
                // var parser = document.createElement('a');
                // parser.href = tab.url;
                // firebase.database().ref('users/' + auth.currentUser.uid).push({
                //   "hostname": parser.hostname,
                //   "visitTime": Date.now()
                // });
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
                        log(tabs[0]);
                        // var parser = document.createElement('a');
                        // parser.href = tabs[0].url; //TODO does this work? i have no idea.
                        // firebase.database().ref('users/' + auth.currentUser.uid).push({
                        //   "hostname": parser.hostname,
                        //   "visitTime": Date.now()
                        // });
                    }
                });
            }
        });
    }
});

chrome.windows.onRemoved.addListener(function(windowId){
    logOnlyEndTime();
});
