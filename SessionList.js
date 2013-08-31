// SessionList


var SessionList = function(){
	this.name = "DEFAULT";
	this.list = new Array();
	this.currentSession = "";
	this.loggingEnabled = false;

	function ToString(){
		return this.name;
	}

}