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

function getDiscretizedTrafficList(hostname, hostnameObj, increment){
    var n = Math.floor((Date.now() - hostnameObj.startTime) / increment);
    console.log(n);
    if(n > 100){return null;}
    var visits = [];
    for(var j = 0; j < n; j++){visits.push(0);}
    var visitEpoch = new Date("1/1/1601 0:00:00");
    var d = new Date();
    hostnameObj.visits.forEach(function(visit){
        var b = new Date(visit);
        var c = new Date(Date.now() - visitEpoch);
        var timeDiff = -Number(d.getTime()) - Number(visit) - Number(visitEpoch);
        var i = Math.floor(timeDiff / increment);
        // visit = visit.getTime() + visitEpoch.getTime();
        // console.log(visit);
        // var i = Math.floor((Date.now() - visit)/increment);
        // var i = Math.floor((new Date() - visit + visitEpoch) / increment);
        // var p = new Date(new Date() - visit + visitEpoch);
        // console.log(new Date(), visit, visitEpoch, p.getDate(), i);
        console.log(c, timeDiff, i);
        if(i >= n){
            console.log("very bad at incrementing.");
            return null;
        }
        visits[i]++;
    });
    // console.log(hostnameObj.visits);
    return visits;
}

//TODO: color is just total number of requests, not proportion of time spent.
function getHeatRect(count){
    var maxDark = 240;
    count = 2*count;
    if(count > 255 + maxDark){count = 255+maxDark;}
    var rgb = "rgb(" + String(maxDark) + "," +
                String(maxDark - count) + "," +
                String(maxDark) + ")";
    return "<svg width='20' height='20'><rect width='20' height='20' " +
    "style='fill:" + rgb + ";stroke-width:3;stroke:rgb(0,0,0)' /></svg>";
    // return "<rect class='increment' fill=rgb(" +
    // count + maxDark + ")></rect>";
}

function getHeatMap(visits){
    var rectRow = "";
    visits.forEach(function(visit){
        rectRow += getHeatRect(visit);
    });
    return rectRow;
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // console.log("HOORAY");
        if(request.message == "newtab_page"){
            var n = request.hostnamesbytraffic.length;
            var increment = 24 * 60 * 60 * 1000; //1 day
            var hostname = null;
            for(var i = n-1; i >= 0; i--){
                hostname = request.hostnamesbytraffic[i];
                if(request.history[hostname].traffic){
                    $("body").append("<p>" + hostname + " : " +
                    String(request.history[hostname].traffic) +
                    "<\p>");
                    console.log(request.history[hostname]);
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
