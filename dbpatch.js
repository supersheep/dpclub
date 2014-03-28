/**
 * 数据订正
 */
var db = require("./db");
var async = require("async");
var request = require("request");
var member = require("./model/member")

var conn = db.getConnection();


var tasks = [];

tasks.push(removeEmptyMember);


conn.query("select * from checkin where memberName=\"[object Object]\" or memberName="undefined" or memberName=\"\" or memberName=\"0\" or `memberName` IS NULL", function(err,rows){

    if(err){
        return cb(err);
    }else{

        rows.forEach(function(row){
            tasks.push(function(done){
                update(row,done);
            });
        });
        async.series(tasks,function(err){
            if(err){
                console.log(err);
            }else{
                console.log("%d row affected\ndone",tasks.length);
            }
            conn.end();
        });
    }
});

function removeEmptyMember(done){
    conn.query("delete from checkin where memberId=\"0\"",done);
}

function update(row,done){
    var id = row.memberId;
    console.log(row);
    member.getNameById(id,function(err,name){
        if(err){
            if(err == "工号不存在"){
                console.log(err, id);
            }else{
                return done(err);
            }
        }
        var query = "update checkin set memberName=\"" + name + "\" where id=" + row.id;
        console.log(query);
        conn.query(query,function(){
            done(null);
        });
    });
}