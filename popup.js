
//
//https://www.google.ca/search?q=Refused+to+execute+inline+script+because+it+violates+the+following+Content+Security+Policy+directive%3A+%22script-src+'self'+chrome-extension-resource%3A&oq=Refused+to+execute+inline+script+because+it+violates+the+following+Content+Security+Policy+directive%3A+%22script-src+'self'+chrome-extension-resource%3A&aqs=chrome.0.57.304&sugexp=chrome,mod=0&sourceid=chrome&ie=UTF-8
//


function chlog_parseUrl( url ) {
    var a = document.createElement('a');
    a.href = url;
    return a;
}

$(document).ready(function() {
	
	$.fn.appendText = function(txt) {
	   return this.each(function(){
		   this.value += txt;
	   });
	};
	
	//
	// TODO: Add listener for Google Chrome searches...
	//

    $("#newSessionButton").click(function() {
		chrome.runtime.sendMessage({action: "NewSession"}, function(response) {
		});
    });

    $("#startSessionButton").click(function() {
		chrome.runtime.sendMessage({action: "StartSession"}, function(response) {
		});
    });

    $("#stopSessionButton").click(function() {
		chrome.runtime.sendMessage({action: "StopSession"}, function(response) {
		});
    });

    $("#getLogButton").click(function() {
		chrome.runtime.sendMessage({action: "GetLogEntries"}, function(response) {
			console.log("LEL");
			console.log(response.logEntryList);
			for(var i=0;i<response.logEntryList.length;i++){
				$("#outputText").appendText(response.logEntryList[i]);
				$("#outputText").appendText("\n");
			}
		});
    });

    $("#noteButton").click(function() {
		//
		// TODO: Create note on currently selected page
		//
		chrome.tabs.query({'active': true, 'currentWindow':true}, function(tabs) {
			if( tabs !== null && tabs.length > 0){
				//tabs[0].id
				//bs[0].title
				//tabs[0].url
				
				var note = prompt("Enter Note for page '" + tabs[0].title + "':");
				if(note){
					alert(note);
				}else{
					alert("No note specified");
				}
			}
		});
    });

});

