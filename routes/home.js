module.exports = function(req,res){
	res.sendfile("index.html",{root: './public'});
}