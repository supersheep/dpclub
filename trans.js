var db = require("./db");
var xlsx = require("xlsx.js");
var fs = require("fs");
var async = require("async");

var data = xlsx(fs.readFileSync("./all.xlsx").toString('base64'));

var members = data.worksheets[0].data.map(function(item){
    return {
        name: item[0].value,
        number: +item[1].value
    }
}).slice(1);



var conn = db.getConnection();
var tasks = [];

members.forEach(function(member){
    tasks.push(function(done){
        conn.query("select * from member where name=?", member.name, function(err, results){
            if(!results.length){
                var q = conn.query("insert into member (name,number,companyId) values (?,?,1)", [member.name, member.number], done);
                console.log(q.sql);
            }else{
                done(null);
            }
        });
    });
});

async.series(tasks,function(err){
    if(err){
        console.err(err);
    }
    console.log("done");
});