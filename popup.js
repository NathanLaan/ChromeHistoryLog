
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



//
//
//
//
//
function updateData(){
	chrome.runtime.sendMessage({action: "GetData"}, function(result) {
		if(result !== undefined && result.sessionList !== undefined){

console.log(result);

			$('#sessionList')
			    .find('option')
			    .remove()
			    .end();

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
			//
			// TODO: error handling. HOWEVER if there is no data yet we also end up here.
			//
			//alert("Error retrieving data");
		}
	});
}



$(document).ready(function() {
	
	$.fn.appendText = function(txt) {
	   return this.each(function(){
		   this.value += txt;
	   });
	};

	$("#sessionList").change(function () {
console.log("CHANGE()");
		$("#outputText").val('');
		if($("#sessionList option:selected")[0] !== undefined){
			//var s = $("#sessionList option:selected")[0].text;
			chrome.runtime.sendMessage({action: "GetData"}, function(result) {
				if(result !== undefined && result.sessionList !== undefined){
					var s = result.sessionList.currentSession;
					for(var i=0;i<result.sessionList.list.length;i++){
						if(s === result.sessionList.list[i].name){
							for(var j=0;j<result.sessionList.list[i].list.length;j++){
console.log("s:" + s + " --- n:" + result.sessionList.list[i].name);
								$("#outputText").appendText(result.sessionList.list[i].list[j].contents);
								$("#outputText").appendText("\n");
							}
							break;
						}
					}
				}else{
					//
					// TODO: error handling. HOWEVER if there is no data yet we also end up here.
					//
					//alert("Error retrieving data");
				}
			});
		}
	});

	//
	// get and load data
	//
	updateData();

    $("#debugButton").click(function() {
		chrome.runtime.sendMessage({action: "DEBUG"}, function(response) {
		});
    });

    $("#newSessionButton").click(function() {
		var name = prompt("New Session Name:", "Session_" + dateTimeNow());
		if(name !== null){
			chrome.runtime.sendMessage({action: "NewSession", sessionName: name}, function(response) {
				//
				// TODO: BUG: outputText is NOT clearing!!!
				//
				if(response.sessionCreated){
					updateData();
					$("#sessionList").change();
				}else{
					//
					// TODO: debug
					//
				}
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
							updateData();
							$("#sessionList").change();
					});
				}else{
					alert("No note specified");
				}
			}
		});
    });

    $('#clearButton').click(function() {
    	if(confirm("Delete all ChromeHistoryLog data?")){
			$('#sessionList')
			    .find('option')
			    .remove()
			    .end();
			$("#sessionList").change();

			chrome.storage.local.remove("SessionListKey", function(){
				updateData();
				//alert("All HistoryLog data has been cleared.");
			});

	    	//chrome.storage.local.clear(function(){
			//	updateData();
				//alert("All HistoryLog data has been cleared.");
	    	//});
	    }
    });

});

