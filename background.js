//
// chrome.storage.local Keys:
//
// LoggingEnabled
// SessionCurrent
// CHLSessionList
//


//
// INITIALIZATION
//
chrome.storage.local.get('CHLSessionList', function(result){	
	console.log("-------INITIALIZATION--result-------");
	console.log(result);
	
	if(result.CHLSessionList === undefined){
		console.log("-------INITIALIZATION--undefined-------");
		var sessionList = new SessionList();
		console.log(sessionList);
		chrome.storage.local.set({'CHLSessionList':sessionList},function(){
			console.log("-------INITIALIZATION--SET-------");
			console.log(sessionList);
		});
	}
});



//
//
//
//
//
function setEnabled(e){
	chrome.storage.local.set({'LoggingEnabled' : e},function(){
		// TODO: debug
	});
}


//
//
//
//
//
function newSession(sessionName){
	if(sessionName === null){
		sessionName = "Session_" + dateTimeNow();
	}
	chrome.storage.local.set({'SessionCurrent' : sessionName},function(){
		// TODO: debug
		console.log("--newSession()--SessionName: " + sessionName);


		chrome.storage.local.get('SessionList', function(result){
			//console.log("LoggingEnabled: " + result.SessionList);
			
		console.log("--newSession()-getSessionList()--result--");
		console.log(result);

			// create the session list.
			// if the get return NULL, we now have a default list.
			var sessionList = new Array();
			
			if(result.SessionList != null){
				sessionList = result.SessionList;
			}
			sessionList[sessionName] = new Array();
			
			chrome.storage.local.set({'SessionList':sessionList},function(){
				// TODO: debug
			});
			
			console.log('--newSession()--sessionList--');
			console.log(sessionList);
		});

	});
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
		+ "  ACTION: " + (request.action == null ?  + "null" : request.action));

	
	if(request.action == "DEBUG"){
	}
	if(request.action == "StartSession"){
		setEnabled(true);
	}
	if(request.action == "StopSession"){
		setEnabled(false);
	}
	if(request.action == "NewSession"){
		setEnabled(false);
		newSession(request.sessionName);
	}
	if(request.action == "AddNote"){
		var logEntry = "DATETIME=" + dateTimeNow();
		logEntry += ", TAB=" + request.tabID;
		logEntry += ", TITLE=" + request.tabTitle;
		logEntry += ", URL=" + request.tabURL;
		logEntry += ", NOTE=" + request.note;

		console.log("NOTE-ENTRY: " + logEntry);
		
		chrome.storage.local.get('SessionCurrent', function(result){
			if(result.SessionCurrent != null){
				addLogEntry(result.SessionCurrent, logEntry);
			}
		});
	}
	
	if(request.action == "GetLogEntries"){
		// get log entries for specified session
		chrome.storage.local.get('SessionCurrent', function(r1){
					console.log("--r1--");
					console.log(r1);
			chrome.storage.local.get('SessionList', function(r2){
					console.log("--r2--");
					console.log(r2);
				if(r2 !== null && r2.SessionList !== null){
					console.log("--NOT-NULL--");
					var list = r2.SessionList[r1.SessionCurrent];
					console.log("--LIST--");
					console.log(list);
					sendResponse({logEntryList: list});
				}else{
					// TODO: debug
				}
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

	chrome.storage.local.get('LoggingEnabled', function(result){
		console.log("LoggingEnabled: " + result.LoggingEnabled);
		if(result.LoggingEnabled){
			chrome.storage.local.get('SessionCurrent', function(result){
				if(result.SessionCurrent != null){
					var logEntry = "DATETIME=" + dateTimeNow();
					logEntry += ", TAB=" + tabId;
					if(tab != null){
						logEntry += ", TITLE=" + tab.title;
						logEntry += ", URL=" + tab.url;
					}
					if(changeInfo != null && changeInfo.status != null){
						logEntry += ", STATUS=" + changeInfo.status;
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
		//console.log("LoggingEnabled: " + result.SessionList);
		
		// create the session list.
		// if the get return NULL, we now have a default list.
		var sessionList = new Array();
		
		if(result.SessionList !== null){
			sessionList = result.SessionList;

			//
			// should never happen...
			//
			if(sessionList[currentSession] === null){
				console.log("--addLogEntry()--sessionList[currentSession]--NULL--");
				sessionList[currentSession] = new Array();
			}
			var logEntryList = sessionList[currentSession];
			logEntryList[logEntryList.length] = logEntry;
			sessionList[currentSession] = logEntryList;
			
			chrome.storage.local.set({'SessionList':sessionList},function(){
				// TODO: debug
			});
			
			console.log('--addLogEntry()--sessionList--');
			console.log(sessionList);
		}else{
			// TODO: something bad has happened, no session list...
		}
	});
}
