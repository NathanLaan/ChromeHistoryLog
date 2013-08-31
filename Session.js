//session

var Session = function(){
	this.name = "DEFAULT";
	this.date = new Date();
	this.list = new Array();

	function ToString(){
		return this.name;
	}
	
}