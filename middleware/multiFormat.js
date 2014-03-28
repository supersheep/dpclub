var xlsx = require('xlsx.js');
var path = require('path');
var _ = require("underscore");


function isTime(val){
    return /\d{2}:\d{2}:\d{2}/.test(val);
}

var parsers = {
    xlsx: function(data){
        if(!_.isArray(data)){
            data = [data];
        }
        var header = [_.keys(data[0])];
        var body = data.map(function(item){
            return _.values(item).map(function(val){
                var format = "General";
                if(isTime(val)){
                    format = "yyyy-mm-dd";
                }
                return {value: val, formatCode: format};
            });
        });

        var excel = xlsx({worksheets: [{
            "name":"sheet",
            "data": header.concat(body)
          }
        ]});

        return new Buffer(excel.base64, 'base64');
    },
    // xml: function(data){
    //     return data;
    // }
}


module.exports = function(req, res, next){
    var format = req.query.format || path.extname(req.path).slice(1);
    res.formatSend = function(code, data){
        var parser = parsers[format] || function(data){return data;}
        data = parser(data);
        res.send(code, data);
    }
    next()
}