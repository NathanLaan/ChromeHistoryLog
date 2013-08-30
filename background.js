//


const ID_SESSION_ENABLED = 'SessionEnabled';
const ID_SESSION_CURRENT = 'SessionCurrent';
const ID_SESSION_LIST = 'SessionList';
const ID_LOGENTRY_LIST = 'LogEntryList';



//
//
//
//
//
function setEnabled(e){
	chrome.storage.local.set({'SessionEnabled' : e});
}


//
//
//
//
//
function newSession(){
	var currentSession = "Session_" + dateTimeNow();
	console.log(currentSession);
	chrome.storage.local.set({'SessionCurrent' : currentSession});
}


//
//
//
//
//
function dateTimeNow(){
	var dt = new Date();
	var yyyy = dt.getFullYear().toString();
	var mm = dt.getMonth().toString();
	var dd = dt.getDate().toString();
	var hh = dt.getHours().toString();
	var mn = dt.getMinutes().toString();
	var ss = dt.getSeconds().toString();
	
	if(mm.length < 2){
		mm = "0" + mm;
	}
	if(dd.length < 2){
		dd = "0" + dd;
	}
	if(hh.length < 2){
		hh = "0" + hh;
	}
	if(mn.length < 2){
		mn = "0" + mn;
	}
	if(ss.length < 2){
		ss = "0" + ss;
	}
	
	return yyyy + "-" + mm + "-" + dd + "-" + hh + ":" + mn + ":" + ss;
}


//
//
//
//
//
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log(
		"SENDER - " 
		+ (sender.tab ? "Content Script: " + sender.tab.url : "Extension")
		+ "  ENABLED: " + (request.action == null ?  + "null" : request.action));

	
	if(request.action == "NewSession"){
		newSession();
	}
	if(request.action == "StartSession"){
		setEnabled(true);
	}
	if(request.action == "StopSession"){
		setEnabled(false);
	}
	if(request.action == "NewSession"){
		setEnabled(false);
		newSession();
	}
	
	if(request.action == "GetLogEntries"){
		// get log entries for specified session
		chrome.storage.local.get('SessionCurrent', function(r1){
			console.log("r1");
			console.log(r1);
			chrome.storage.local.get('SessionList', function(r2){
				console.log("r2");
				console.log(r2);
				var list = r2.SessionList[r1.SessionCurrent];
				console.log(list);
				sendResponse({logEntryList: list});
			});
		});
	}
	
	return true;
});


//
//
//
//
//
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	//status ( optional string ) The status of the tab. Can be either loading or complete.
	//url ( optional string ) The tab's URL if it has changed.
	//pinned ( optional boolean ) The tab's new pinned state.
	//favIconUrl ( optional string ) The tab's new favicon URL.
	//console.log("TAB: " + tabId);
	//console.log(changeInfo);

	chrome.storage.local.get('SessionEnabled', function(result){
		console.log("SessionEnabled: " + result.SessionEnabled);
		if(result.SessionEnabled){
			chrome.storage.local.get('SessionCurrent', function(result){
				if(result.SessionCurrent != null){
					var logEntry = dateTimeNow();
					if(changeInfo != null && changeInfo.status != null){
						logEntry += " STATUS=" + changeInfo.status;
					}
					if(tab != null){
						logEntry += " URL=" + tab.url;
					}
					console.log("LOG-ENTRY: " + logEntry);
					
					addLogEntry(result.SessionCurrent, logEntry);
				}
			});
		}
	});
});


//
//
//
//
//
function addLogEntry(currentSession, logEntry){
	chrome.storage.local.get('SessionList', function(result){
		console.log("SessionEnabled: " + result.SessionList);
		
		// create the session list.
		// if the get return NULL, we now have a default list.
		var list = new Array();
		
		if(result.SessionList != null){
			list = result.SessionList;
		}
		if(list[currentSession] == null){
			list[currentSession] = new Array();
		}
		list[list.length] = logEntry;
		
		chrome.storage.local.set({'SessionList':list},function(){
			// TODO: debug
		});
		
		//console.log(list);
	});
}
