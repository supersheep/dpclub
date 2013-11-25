var request = require("request");
var config = require("../config.js");

function addZero(id,num){
	id = id+"";
	var zeros = "";
	if(id.length < num){
		for(var i =0;i<num-id.length;i++){
			zeros+="0";
		}
		return zeros+id;
	}else{
		return id;
	}
}

exports.getNameById = function(id,callback){
	// return callback(null,undefined);
	var url = config.urls.get_name_by_no + "?no=" + addZero(id,7);
	
	request.get(url,function(err,res,data){
		if(data === "查询失败"){
			callback("工号不存在");
		}else{
			callback(err,data);	
		}
	});
}