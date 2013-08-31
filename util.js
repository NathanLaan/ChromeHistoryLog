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