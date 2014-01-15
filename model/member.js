var request = require("request");
var config = require("../config.js");
var Model = require("./base");
var MemberModel = new Model("club");


module.exports = MemberModel;

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

MemberModel.getNameById = function(id,callback){
    // return callback(null,undefined);
    var url = config.urls.get_name_by_no + "?no=" + addZero(id,7);
    var db = this.db;

    db.query("select name from member where number=?",id,function(err,results){
        if(err){
            return callback(err);
        }else{
            if(results.length == 0){
                request.get(url,function(err,res,data){
                    if(data === "查询失败"){
                        callback("工号不存在");
                    }else{
                        callback(err,data);
                        db.query("insert into member set ?",{
                            name:data,
                            number:id,
                            companyId:1
                        });
                    }
                });
            }else{
                callback(null,results[0].name)
            }
        }
    });
}