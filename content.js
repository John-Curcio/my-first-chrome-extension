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
        console.log("HOORAY");
        if(request.message == "new_tab_created"){
            domainFreqs = getDomainFreqs(request.history);
            for(var [domain, visits] of domainFreqs){
                console.log(visits);
                $("body").append("<p>" + domain + " : " + String(visits) + "<\p>");
            }
            // request.history.forEach(function(historyItem){
            //     $("body").append("<p>" + extractDomain(historyItem) + "<\p>");
            // });
        }
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
    historyItems.forEach(function(item){
        domains.push(extractDomain(item));
    });
    historyItems = domains;
    // historyItems.map(extractDomain);
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

//copied from http://stackoverflow.com/questions/8498592/extract-root-domain-name-from-string
var extractDomain = function(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
};
//
// var foo = function(){
//     console.log("call to foo() in content.js")
//     // return "YEAH";
//     // document.write("YEAH\n");
//     // document.write("what");
//     for(var i = 0; i < 3; i++){
//         $("body").append("<p>this is an appendage<\p>");
//     }
//     // $("p").append("this is an appendage");
//
//     return null;
// };
//
// $(function(){
//     console.log("calling anonymous function");
//     foo();
// })
