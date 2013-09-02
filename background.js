//
// chrome.storage.local Keys:
//
// SessionListKey
//


//
// INITIALIZATION
//
function init(callback){
	chrome.storage.local.get('SessionListKey', function(result){	
		console.log("-------INITIALIZATION--result-------");
		console.log(result);
		
		if(result.SessionListKey === undefined){
			console.log("-------INITIALIZATION--undefined-------");
			var sessionList = new SessionList();
			console.log(sessionList);
			chrome.storage.local.set({'SessionListKey':sessionList},function(){
				console.log("-------INITIALIZATION--SET-------");
				console.log(sessionList);
				toggleIcon(function(){
					if(callback){
						callback();
					}
				});
			});
		}
	});
}

init(function(){
	console.log("-------INITIALIZATION-COMPLETE-------");
});



//
//
//
//
//
function setEnabled(enabled){
	chrome.storage.local.get('SessionListKey', function(result){	
		console.log("-------setEnabled()--GET-------");
		console.log(result);
		
		if(result.SessionListKey !== undefined){
			var sessionList = result.SessionListKey;
			sessionList.loggingEnabled = enabled;
			chrome.storage.local.set({'SessionListKey':sessionList},function(){
				console.log("-------setEnabled()--SET-------");
				toggleIcon();
			});
		}else{
			// TODO: debug
		}
	});
}



function toggleIcon(callback){
	chrome.storage.local.get('SessionListKey', function(result){
		if(result.SessionListKey !== undefined){
			var sessionList = result.SessionListKey;
			if(sessionList.loggingEnabled){
				//chrome.browserAction.setIcon({'path':'script-import.png'});
				chrome.browserAction.setIcon({'path':'record-16x16.png'});
			}else{
				chrome.browserAction.setIcon({'path':'script-small-16.png'});
			}
			if(callback){
				callback();
			}
		}else{
			// TODO: debug
		}
	});
}


//
//
//
//
//
function newSession(sessionName, sendResponse){
	if(sessionName === null){
		sessionName = "Session_" + dateTimeNow();
	}
	chrome.storage.local.get('SessionListKey', function(result){		
		if(result.SessionListKey !== undefined){
			var sessionList = result.SessionListKey;
			var found = false;
			for(var i=0;i<sessionList.list.length;i++){
				if(sessionList.list[i] !== undefined){
					if(sessionList.list[i].name === sessionName){
						found = true;
						break;
					}
				}
			}
			if(found){
				//
				// TODO: need to handle error condition and notify user...
				//
				console.log("-------DUPLICATE-SESSION-NAME-------")
				return false;
			}else{
				var session = new Session();
				session.name = sessionName;
				sessionList.loggingEnabled = false;
				sessionList.currentSession = sessionName;
console.log(">>>CUR: " + sessionList.currentSession);
				sessionList.list[sessionList.list.length] = session;
				chrome.storage.local.set({'SessionListKey':sessionList},function(){
					console.log("-------newSession()--SET-------");
					console.log(sessionList);
					toggleIcon();
					sendResponse({sessionCreated: true});
				});
			}
		}else{
			// TODO: debug
			sendResponse({sessionCreated: false});
		}
	});
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
		chrome.storage.local.get('SessionListKey', function(result){	
			console.log("-------DEBUG-------");
			console.log(result);
			console.log("-------DEBUG-------");
		});
	}
	if(request.action == "StartSession"){
		setEnabled(true);
		sendResponse({message: "Session started."});
	}
	if(request.action == "StopSession"){
		setEnabled(false);
		sendResponse({message: "Session stopped."});
	}
	if(request.action == "NewSession"){
		newSession(request.sessionName, sendResponse);
	}
	if(request.action == "AddNote"){
	    chrome.tabs.query({'active': true, 'currentWindow':true}, function(tabs) {
	        if( tabs !== null && tabs.length > 0){
				log(tabs[0], tabs[0].id, tabs[0].status, request.note);
				sendResponse({message: "Note added"});
	        }
	    });
	}
	
	if(request.action == "GetLogEntries"){
		chrome.storage.local.get('SessionListKey', function(result){
			if(result.SessionListKey !== undefined){
				sendResponse({logEntryList: result.SessionListKey});
			}else{
				//
				// TODO: need to handle error messages on the other end
				//
				sendResponse({errorMessage: "List not found"});
			}
		});
	}
	if(request.action === "GetData"){
		chrome.storage.local.get('SessionListKey', function(result){
			if(result.SessionListKey !== undefined){
				console.log("-------GetData()--GOOD-------");
				sendResponse({sessionList: result.SessionListKey});
			}else{
				console.log("-------GetData()--ERROR:List-Not-Found-------");
				//
				// TODO: need to handle error messages on the other end
				//
				sendResponse({errorMessage: "List not found"});
			}
		});
	}
	if(request.action === "ClearData"){
		chrome.runtime.sendMessage({action: "StopSession"}, function(response) {
			chrome.storage.local.remove("SessionListKey", function(){
				console.log("-------ClearData-------");
				init(function(){
					sendResponse({message: "All HistoryLog data has been cleared."});
				});
			});
	    	//chrome.storage.local.clear(function(){
			//	updateData();
				//alert("All HistoryLog data has been cleared.");
	    	//});
		});

	}
	
	return true;
});



//
//
// TODO: Log CTRL-F in-page searches
//
// http://stackoverflow.com/questions/14529486/chrome-extension-how-to-bind-hook-to-the-browsers-search-invoked-event
//
// https://developer.chrome.com/extensions/commands.html
//
//




//
//
//
function log(tab, tabID, status, message){
	//
	// TODO: log event
	//
	chrome.storage.local.get('SessionListKey', function(result){
		if(result.SessionListKey !== undefined){
			var sessionList = result.SessionListKey;
			if(sessionList.loggingEnabled){
				//console.log("-------onUpdated()--LoggingEnabled-------");
				var logEntry = new LogEntry();
				logEntry.contents = "DATETIME=" + dateTimeNow();
				logEntry.contents += ", TAB=" + tabID;
				if(tab !== undefined){
					logEntry.contents += ", TITLE=" + tab.title;
					logEntry.contents += ", URL=" + tab.url;
				}
				if(status !== undefined){
					logEntry.contents += ", STATUS=" + status;
				}
				if(message !== undefined){
					logEntry.contents += ", NOTE=" + message;
				}

				// add logEntry to session
				for(var i=0;i<sessionList.list.length;i++){
					if(sessionList.list[i] !== undefined){
						if(sessionList.list[i].name === sessionList.currentSession){
							//console.log("-------onUpdated()--FOUND-------");
							sessionList.list[i].list[sessionList.list[i].list.length] = logEntry;
							break;
						}
					}
				}

				chrome.storage.local.set({'SessionListKey':sessionList},function(){
					//console.log("-------onUpdated()--SET-------");
					console.log(result);
				});

			}
		}else{
			//
			// TODO: error handling
			//
		}
	});
}



//
//
//
//
//
chrome.tabs.onUpdated.addListener(function(tabID, changeInfo, tab){
	log(tab, tabID, changeInfo.status, "");
});
