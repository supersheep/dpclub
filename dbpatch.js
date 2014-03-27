/**
 * 数据订正
 */
var db = require("./db");
var async = require("async");
var request = require("request");
var member = require("./model/member")

var conn = db.getConnection();

conn.query("select * from checkin where memberName=\"[object Object]\"", function(err,rows){
    if(err){
        return cb(err);
    }else{
        var tasks = [];
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


function update(row,done){
    var id = row.memberId;
    member.getNameById(id,function(err,name){
        if(err){return done(err);}
        var query = "update checkin set memberName=\"" + name + "\" where id=" + row.id;
        console.log(query);
        conn.query(query,function(){
            done(null);
        });
    });
}