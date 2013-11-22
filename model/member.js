var request = require("request");

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
	var url = "http://cenalulu.no-ip.org:5080/groupcheckin/get_name_by_no.php?no=" + addZero(id,7);
	
	request.get(url,function(err,res,data){
		if(data === "查询失败"){
			callback("工号不存在");
		}else{
			callback(err,data);	
		}
	});
}