
//
//https://www.google.ca/search?q=Refused+to+execute+inline+script+because+it+violates+the+following+Content+Security+Policy+directive%3A+%22script-src+'self'+chrome-extension-resource%3A&oq=Refused+to+execute+inline+script+because+it+violates+the+following+Content+Security+Policy+directive%3A+%22script-src+'self'+chrome-extension-resource%3A&aqs=chrome.0.57.304&sugexp=chrome,mod=0&sourceid=chrome&ie=UTF-8
//


function chlog_parseUrl( url ) {
    var a = document.createElement('a');
    a.href = url;
    return a;
}

$(document).ready(function() {

	var enabled = false;
	
	
	$.fn.appendText = function(txt) {
	   return this.each(function(){
		   this.value += txt;
	   });
	};

	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
		if(enabled){
			//status ( optional string ) The status of the tab. Can be either loading or complete.
			//url ( optional string ) The tab's URL if it has changed.
			//pinned ( optional boolean ) The tab's new pinned state.
			//favIconUrl ( optional string ) The tab's new favicon URL.
			//console.log("TAB: " + tabId);
			//console.log(changeInfo);
			
			
			chrome.tabs.get(tabId, function(tab){
				var s = (new Date()).toString("yyyy/MM/dd-hh:mm");
				if(changeInfo != null && changeInfo.status != null){
					s += " STATUS: " + changeInfo.status;
				}
				if(tab){
					s+= " URL: " + tab.url;
				}
				s += "\n";
				//console.log(s);
				$("#outputText").appendText(s);
			});
		}
	});
	
	//
	// TODO: Add listener for Google Chrome searches...
	//

    $("#startButton").click(function() {
		enabled = true;
			console.log("ENABLED");
    });

    $("#stopButton").click(function() {
		enabled = false;
    });

    $("#noteButton").click(function() {
		//
		// TODO: Create note on currently selected page
		//
		chrome.tabs.query({'active': true, 'currentWindow':true}, function(tabs) {
			if( tabs !== null && tabs.length > 0){
				//tabs[0].id
				//tabs[0].title
				//tabs[0].url
			}
		});
    });

});

