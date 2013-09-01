
//
//https://www.google.ca/search?q=Refused+to+execute+inline+script+because+it+violates+the+following+Content+Security+Policy+directive%3A+%22script-src+'self'+chrome-extension-resource%3A&oq=Refused+to+execute+inline+script+because+it+violates+the+following+Content+Security+Policy+directive%3A+%22script-src+'self'+chrome-extension-resource%3A&aqs=chrome.0.57.304&sugexp=chrome,mod=0&sourceid=chrome&ie=UTF-8
//


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

	$("#sessionList").change(function () {
		$("#outputText").val('');
		var s = $("#sessionList option:selected")[0].text;
		chrome.runtime.sendMessage({action: "GetData"}, function(result) {
						console.log("-------GetData-------1-------");
			if(result !== undefined && result.sessionList !== undefined){
						console.log("-------GetData-------2-------");
				for(var i=0;i<result.sessionList.list.length;i++){
						console.log("-------GetData-------3-------");
						console.log("s: " + s);
						console.log("n: " + result.sessionList.list[i].name);
					if(s === result.sessionList.list[i].name){
						console.log("-------GetData-------4-------");
						for(var j=0;j<result.sessionList.list[i].list.length;j++){
							$("#outputText").appendText(result.sessionList.list[i].list[j].contents);
							$("#outputText").appendText("\n");
						}
						break;
					}
				}
			}else{
				alert("Error retrieving data");
			}
		});
	});

	//
	// get and load data
	//
	chrome.runtime.sendMessage({action: "GetData"}, function(result) {
		console.log(result);
		if(result !== undefined && result.sessionList !== undefined){
			$("#sessionList").empty();
			for(var i=0;i<result.sessionList.list.length;i++){
				if(result.sessionList.list[i].name === result.sessionList.currentSession){
					$('#sessionList')
						.append($("<option selected></option>")
						.attr("value",result.sessionList.list[i].name)
						.text(result.sessionList.list[i].name));
				}else{
					$('#sessionList')
						.append($("<option></option>")
						.attr("value",result.sessionList.list[i].name)
						.text(result.sessionList.list[i].name));
				} 
			}
			// trigger the change() event to load the initial data
			$("#sessionList").change();
		}else{
			alert("Error retrieving data");
		}
	});
	
	//
	// TODO: load session list
	//

    $("#debugButton").click(function() {
		chrome.runtime.sendMessage({action: "DEBUG"}, function(response) {
		});
    });

    $("#newSessionButton").click(function() {
		var name = prompt("New Session Name:", "Session_" + dateTimeNow());
		if(name !== null){
			chrome.runtime.sendMessage({action: "NewSession", sessionName: name}, function(response) {
			});
		}
    });

    $("#startSessionButton").click(function() {
		chrome.runtime.sendMessage({action: "StartSession"}, function(response) {
		});
    });

    $("#stopSessionButton").click(function() {
		chrome.runtime.sendMessage({action: "StopSession"}, function(response) {
		});
    });

	/*
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
	*/

    $("#addNoteButton").click(function() {
		//
		// TODO: Create note on currently selected page
		//
		chrome.tabs.query({'active': true, 'currentWindow':true}, function(tabs) {
			if( tabs !== null && tabs.length > 0){
				var noteText = prompt("Enter Note for page '" + tabs[0].title + "':");
				if(noteText){
					chrome.runtime.sendMessage({
						action: "AddNote", 
						note: noteText, 
						tabID: tabs[0].id, 
						tabTitle: tabs[0].title, 
						tabURL: tabs[0].url}, function(response) {
							// TODO: debug
					});
				}else{
					alert("No note specified");
				}
			}
		});
    });

    $('#clearButton').click(function() {
    	if(confirm("Delete all ChromeHistoryLog data?")){
	    	chrome.storage.local.clear(function(){
	    		alert("Cleared!");
	    	});
	    }
    });

});

