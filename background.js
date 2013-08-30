//
var enabled = false;


var logEntryList = new Array();
var sessionList = new Array();

var currentSession;


function newSession(){
			var s = (new Date()).toString("yyyy/MM/dd-hh:mm");
	currentSession = "Session " + s;
	console.log(currentSession);

	sessionList[sessionList.length] = currentSession;
	
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log(
		"SENDER - " 
		+ (sender.tab ? "Content Script: " + sender.tab.url : "Extension")
		+ "  ENABLED: " + (request.action == null ?  + "null" : request.action));

	
	if(request.action == "NewSession"){
		newSession();
	}
	if(request.action == "StartSession"){
		newSession();
	}
	if(request.action == "StopSession"){
		newSession();
		enabled = false;
	}
	if(request.action == "NewSession"){
		if(currentSession == null || currentSession == ""){
			newSession();
			enabled = true;
		}
	}
	
	if(request.action == "GetLogEntries"){
		sendResponse({logEntries: logEntryList});
	}
	
});

function saveLogEntry(logEntry){
	logEntryList[logEntryList.length] = logEntry;

	chrome.storage.local.set({'sessions':sessionList},function(){
		// TODO: debug
	});
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