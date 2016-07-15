module.exports = {
    sendContactToDb: sendContactToDb//,
    //find: findAllFromDb
}
//
var mycon = require('./connToMongo');
var myfbcon = require('./connToFb');
var server_ip = 'localhost';
var mongodb = require('mongodb');
var async = require('async');
var server = new mongodb.Server(server_ip, 27017, { auto_reconnect: true });
var log = console.log;
var db = new mongodb.Db('mydb', server);




function sendContactToDb(clientdata, androidCallback) {
    var phoneContact = clientdata.phoneContact;
    var userid = clientdata.userid;
    var userpw = clientdata.userpw;
	var fbContact = null;
    try {
        async.waterfall([
            function (callback) {
                log("waterfall 1");
                db.open(function (err, db) {
                    if (err) callback(err, db);
                    else callback(null, db);
                });
            },
            function (db, callback) {
                log("waterfall 2");
                db.collection(userid, function (err, collection) {
                    if (err) callback(err, 'wtf 2 err');
                    else callback(null, collection);
                });
            },
			function (collection, callback){
				log("waterfall 2.5");
				if (clientdata.fbinfo != undefined) {
				    var token = clientdata.fbinfo.token; console.log(token);
				    myfbcon.loadFriendByToken(token, function (fbres) {
				        fbContact = fbres.data;
				        callback(null, collection);
				    })
				} else {
				    callback(null, collection);
				}
			},
            function (collection, callback){
                log('waterfall 2.75 / deleteEverything');
                collection.deleteMany({},null, function (err, res) {
                    console.log('delete all');
                    if (err) { console.log(err); }
                    //else console.log(res);
                    callback(null, collection);
                })
            },
            function (collection, callback) {
                log("waterfall 3");
                var task = [];
                phoneContact.forEach(function (item) {
                    task.push(function (callb) {
                        mycon.insert(collection, item, callb);
                    });
                });
                if (fbContact != null) {
                    fbContact.forEach(function (item) {
                        task.push(function (callb) {
                            mycon.insert(collection, item, callb);
                        });
                    });
                }
                async.parallel(task, function (err, results) {
                    if (err) callback(err);
                    else callback(null, collection);
                });
            },
            function (collection, callback) {
                log("waterfall 4");
                mycon.findAll(collection, function (result) {
                    console.log('************find ALL*************');
                    //console.log(result);
                    callback(null,result);
                });
            }
        ],
        function (err, result) {
            log("waterfall end");
            if (err) throw err;
            else log(result);
            db.close();
            if(!err)androidCallback(result);
        });
    } catch (err) {
        log("waterfall error");
        log(err);
        androidCallback(null);
    }
}

