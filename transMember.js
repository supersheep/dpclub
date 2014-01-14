/**
 * 导入用户
 */
var db = require("./db");
var async = require("async");
var request = require("request");
var member = require("./model/member")

db.connection.query("select DISTINCT memberId,memberName from checkin", function(err,rows){
    if(err){
        throw err;
    }else{
        var tasks = [];
        rows.forEach(function(row){
            tasks.push(function(done){
                insert(row,done);
            });
        });
        async.series(tasks,function(err){
            if(err){
                console.log(err);
            }else{
                console.log("%d row affected\ndone",tasks.length);
            }
            db.connection.end();
        });
    }
});


function insert(row,done){
    var id = row.memberId;

    var query = "insert into member (name,number,companyId) values ("
        +"\"" + row.memberName + "\","
        + row.memberId + ","
        + 1
        +")";
    console.log(query);
    db.connection.query(query,function(){
        done(null);
    });
}