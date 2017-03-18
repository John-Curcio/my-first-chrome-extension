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
//alert("i eat a nigga ass like almond joy");
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(request.didAnything)
        if( request.message == "clicked_browser_action" ){
            console.log(request.message);
            // console.log(request.iconClicks);
            console.log("about to log history")
            console.log(request.pageHistory.length)
            for (i=0; i < request.pageHistory.length; i++) {
                console.log(request.pageHistory[i]);
            }
            console.log("should have logged history")
            //Line below uses jQuery to log the URL of the first external link on the page
            //I'm unfamiliar with jQuery, so best not to meddle with that.
            var firstHref = $("a[href^='http']").eq(0).attr("href");
            console.log(firstHref);
            console.log("Hey just clicked the rainbow dildo");

            // Just to confuse you :)
            if( request.iconClicks % 2 == 0){
                alert("i eat a nigga ass like almond joy");
            }
            // tells background.js what url to open in the new tab.
            // chrome.runtime.sendMessage({"message": "open_new_tab", "url": firstHref});
        };
    }
);

var foo = function(){
    console.log("call to foo() in content.js")
    // return "YEAH";
    // document.write("YEAH\n");
    // document.write("what");
    for(var i = 0; i < 3; i++){
        $("body").append("<p>this is an appendage<\p>");
    }
    // $("p").append("this is an appendage");

    return null;
};

$(function(){
    console.log("calling anonymous function");
    foo();
})
