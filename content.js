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


function getHtmlHeatMap(rectList){
    var html = "";
    rectList.forEach(function(rect){
        var rgb = "rgb(" + String(20) + "," +
                        String(Math.floor(rect*240)) + "," +
                        String(240) + ")";
        html += "<svg width='20' height='20'><rect width='20' height='20' " +
                "style='fill:" +
                rgb +
                ";stroke-width:3;stroke:rgb(0,0,0)' /></svg>";
    });
    return html;
}

function getHeatMap(visits, increment){
    var timeCutOff = 12 * 60 * 60 * 1000; //30 minutes
    var n = Math.floor(timeCutOff / increment);
    var rectList = new Array(n);
    for(i = 0; i < n; i++){
        rectList[i] = 0.0;
    }
    visits.forEach(function(visit){
        while(visit.end > visit.start){
            if((Date.now() - visit.start) <= timeCutOff){
                var i = Math.floor((Date.now() - visit.start)/increment);
                console.log((Date.now() - visit.start)/increment);
                console.log(i);
                if(i < n){
                    rectList[i] += (visit.end - visit.start)/increment;
                    if(rectList[i] > 1.0){
                        rectList[i] = 1.0;
                    }
                }
            }
            visit.start += increment;
        }
    });
    return getHtmlHeatMap(rectList);
}


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // console.log("HOORAY");
        if(request.message == "newtab_page" && ("hostnamesbytraffic" in request)){
            var n = request.hostnamesbytraffic.length;
            var increment = 60 * 60 * 1000; //1 hour
            var hostname = null;
            for(var i = n-1; i >= 0; i--){
                hostname = request.hostnamesbytraffic[i];
                if(request.history[hostname].traffic){
                    $("body").append("<p>" + hostname + " : " +
                    getHeatMap(request.history[hostname].visits, increment) +
                    "<\p>");
                }
                // $("body").append("<p>" + hostname + " : " +
                // getHeatMap(getDiscretizedTrafficList(hostname,
                //     request.history[hostname], increment)) +
                // // String(request.history[hostname].traffic) +
                // "<\p>");
            }
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

// function getDomainFreqs(historyItems){
//     domains = [];
//     // historyItems.forEach(function(item){
//     //     domains.push(extractDomain(item));
//     // });
//     historyItems = domains;
//     console.log(historyItems);
//     var domainFreqs = new Map();
//     historyItems.forEach(function(domain){
//         if(domainFreqs.has(domain)){
//             domainFreqs.set(domain, domainFreqs.get(domain) + 1);
//         } else {
//             domainFreqs.set(domain, 1);
//         }
//     });
//     return domainFreqs;
// }
chrome.runtime.sendMessage({"message": "newtab_page"});
