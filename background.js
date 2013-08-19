//
var enabled = false;


var logEntryList = new Array();

var currentSession;


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log(
		"SENDER - " 
		+ (sender.tab ? "Content Script: " + sender.tab.url : "Extension")
		+ "  ENABLED: " + (request.enabled == null ?  + "null" : request.enabled));
	if (request.enabled != null) {
		enabled = request.enabled;
	}else{
		enabled = false;
	}
	
	if(request.message == "getLogEntries"){
		sendResponse({logEntries: logEntryList});
	}
	
});

function saveLogEntry(var logEntry){
	logEntryList[logEntryList.length] = s;
}

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
			//s += "\n";
			saveLogEntry(s);
			//alert(s);
			//console.log(s);
			//$("#outputText").appendText(s);
		});
	}
});