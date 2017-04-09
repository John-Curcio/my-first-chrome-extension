/*
CONTENT FILES are javascript files that run in the context of webpages.
So they can read details of the webpages you visit and make changes to them.

Examples of what they can do:
- increase font size of a webpage you visit
- open the first link on a webpage you visit into a new tab

They cannot use chrome.* APIs, with the exception of extension, i18n, runtime,
and storage. Also, they can't use variables or functions defined by the webpage.

We get around these limitations by passing messages between the content file
and the webpage - not very limiting after all, then.
*/
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // console.log("HOORAY");
        // if(request.message == "new_tab_created"){
        //     domainFreqs = getDomainFreqs(request.history);
        //     for(var [domain, visits] of domainFreqs){
        //         console.log(visits);
        //         $("body").append("<p>" + domain + " : " + String(visits) + "<\p>");
        //     }
        // }
        if( request.message == "clicked_browser_action" ){
            //Line below uses jQuery to log the URL of the first external link on the page
            //I'm unfamiliar with jQuery, so best not to meddle with that.
            var firstHref = $("a[href^='http']").eq(0).attr("href");
            console.log(firstHref);
            console.log("Hey just clicked the rainbow dildo");
            // Just to confuse you :)
            if( request.iconClicks % 2 === 0){
                alert("i eat a nigga ass like almond joy");
            }
            // tells background.js what url to open in the new tab.
            // chrome.runtime.sendMessage({"message": "open_new_tab", "url": firstHref});
        }
    }
);

function getDomainFreqs(historyItems){
    domains = [];
    // historyItems.forEach(function(item){
    //     domains.push(extractDomain(item));
    // });
    historyItems = domains;
    console.log(historyItems);
    var domainFreqs = new Map();
    historyItems.forEach(function(domain){
        if(domainFreqs.has(domain)){
            domainFreqs.set(domain, domainFreqs.get(domain) + 1);
        } else {
            domainFreqs.set(domain, 1);
        }
    });
    return domainFreqs;
}

var foo = function(){
    console.log("call to foo() in content.js");
    for(var i = 0; i < 3; i++){
        $("body").append("<p>this is an appendage. It's dynamically-generated, so don't hate.<\p>");
    }
};

$(function(){
    // TODO: this should simply request a message from background.js
    // and put this in background.js
    // except construct page content in background.js
    chrome.tabs.getCurrent(function(tab){
        console.log(tab.url);
        //this seems weird, but hey, it's simple and works
        if(tab.url === "chrome://newtab/"){
            foo();
        }
    });
});
