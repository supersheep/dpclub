var request = require("request");

function addZero(id,num){
	id = id+"";
	var zeros = "";
	if(id.length < num){
		for(var i =0;i<num-length;i++){
			zeros+="0";
		}
		return zeros+id;
	}else{
		return id;
	}
}

exports.getNameById = function(id,callback){
	return callback(null,"jiayi");
	// return callback(null,undefined);
	var url = "http://192.168.26.167/groupcheckin/get_name_by_no.php?no=" + addZero(id,7);
	
	request.get(url,function(err,res,data){
		if(data === ""){
			callback("memberId not found");
		}else{
			callback(err,data);	
		}
	});
}