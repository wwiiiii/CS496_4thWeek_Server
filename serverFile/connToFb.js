module.exports = {
	loadFriendByToken : loadFriendByToken
}


//query : https형식, GET, 
//https://graph.facebook.com/me?fields=id,name,email&access_token=token_string
var https = require('https');
var async = require('async');
var PythonShell = require('python-shell');
var result = null;

function loadFriendByToken(token, finCallback) {
	async.waterfall([
	function(callback){
		var sh = new PythonShell('getFBfriends.py');
		sh.send(token);
		sh.on('message', function(msg){
			result = JSON.parse(msg);
        		console.log('msg arrived');
			//console.log(result);
			callback(null, result);
		});
		sh.end(function (err){
	        	if(err) console.log(err);
	        	console.log('finished');
		});
	},
	function (res, callback) {
	    if (res == undefined) callback(callback(null, null));
	    else {
	        for (var i = 0; i < res.data.length; i++) {
	            res.data[i].src = "facebook";
	        }
	        callback(null, res);
	    }
	}],
	function (err, res){
		console.log('waterfall end');
		result = res;
		if(err) {console.log(err); finCallback(null);}
		else finCallback(res);
	});
}
//var token = 'EAACEdEose0cBAJWwOTloOxdSGk8xIfUvuppX8AHPts5xQQrPWhb0G4rgNJ8VGJ8wjIhrO3dzF4YQbk7xv2YnqDwt4spJy5ZCmatCB2cIluKifYJJVtWRYbiZAZCbj1ZA1T7jxp7lAdgpi0WL1al64FIuNGjn8YjqYZC01rEBZBfgZDZD';
var token = 'EAACEdEose0cBAPtdbKoznrP1YocJYXcYxolBrSDlwMoHQv3i9oaHcw8RTcrzZCisisFf3fm3qUoYphcc5Vmo0SReZCyAHIZCVWIpyaPSMC163hGO3YX6mRyHZB0ncw0oVpsEG4t5RQpsmE9xiFKh258svJH2Bmc734zUGbOOVQZDZD'
