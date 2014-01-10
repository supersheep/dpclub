/**
 * 数据订正
 */
var db = require("./db");
var async = require("async");
var request = require("request");
var member = require("./model/member")

db.connection.query("select * from checkin where memberName=\"\"", function(err,rows){
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
            console.log("%d row affected\ndone",tasks.length);
            db.connection.end();
        });
    }
});


function update(row,done){
    var id = row.memberId;
    member.getNameById(id,function(err,name){
        if(err){return done(err);}
        var query = "update checkin set memberName=\"" + name + "\" where id=" + row.id;
        console.log(query);
        db.connection.query(query,function(){
            done(null);
        });
    });
}