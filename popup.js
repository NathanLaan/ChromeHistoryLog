
//
//https://www.google.ca/search?q=Refused+to+execute+inline+script+because+it+violates+the+following+Content+Security+Policy+directive%3A+%22script-src+'self'+chrome-extension-resource%3A&oq=Refused+to+execute+inline+script+because+it+violates+the+following+Content+Security+Policy+directive%3A+%22script-src+'self'+chrome-extension-resource%3A&aqs=chrome.0.57.304&sugexp=chrome,mod=0&sourceid=chrome&ie=UTF-8
//

function chlog_loadPages(){
    chrome.windows.getAll({populate: true}, function(windows) {
        //each window will contain an array of tabs in it
        if(windows !== null){
            pages = new Array();
            var list = $('#browserPagesList')[0];
            list.options.length = 0; 
            for (var i=0 ; i<windows.length ; i++) {
                for (var j=0; j<windows[i].tabs.length; j++) {
                    if( windows[i].tabs[j].title !== "chlog") {
                        list.options[list.options.length] = new Option(windows[i].tabs[j].title, windows[i].tabs[j].id);
                    }
                };
            };

            chrome.tabs.query({'active': true, 'currentWindow':true}, function(tab) {
                if( tab !== null && tab.length > 0){

                    for (var i=0 ; i<list.options.length ; i++) {
                        //alert("T: " + tab[0].title + " I: " + tab[0].id + " V: " + list.options[i].value)
                        if( list.options[i].value == tab[0].id ) {
                            //alert("T: " + tab[0].title + " I: " + tab[0].id + " V: " + list.options[i].value)
                            list.options[i].defaultSelected = true;
                            list.selectedIndex = i;
                        }
                    };
                }
            });

        }
    });
}

function chlog_parseUrl( url ) {
    var a = document.createElement('a');
    a.href = url;
    return a;
}

$(document).ready(function() {

    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        console.log("onMessage: " + request.winID);
        chlog_loadPages();
    });

    $("#navButton").click(function() {
        var pageID = parseInt($('#browserPagesList').val());

        chrome.tabs.get(pageID,function(tab) {
            if(tab){            
                var a = chlog_parseUrl(tab.url);
                var u = "http://0-" + a.host + ".aupac.lib.athabascau.ca" + a.pathname + a.search;
                chrome.tabs.update(pageID, {url: u, active: true});
                //
                // TODO: Do I need to manually close the popup window? The "ACTIVE: TRUE" value sent
                // in the chrome.tabs.update() function call causes the popup to disappear, but do I
                // need to close the window to release resources?
                //
            } else {
                //
                // TODO: Error message to user
                //
            }
        });
    });

    chlog_loadPages();
});

