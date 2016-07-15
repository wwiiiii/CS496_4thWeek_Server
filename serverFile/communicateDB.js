module.exports = {
    addUser: addUser
    removeUser: removeUser
}
//
var mycon = require('./connToMongo');
var server_ip = 'localhost';
var mongodb = require('mongodb');
var async = require('async');
var server = new mongodb.Server(server_ip, 27017, { auto_reconnect: true });
var log = console.log;
var db = new mongodb.Db('kaistGoDB', server);

//나중에 중복 유저가 있는지 검사 루틴 추가
function addUser(user, addUserCallback) {
    try {
        async.waterfall([
            function (callback) {
                log("addUser wtf 1");
                db.open(function (err, db) {
                    if (err) callback(err, 'wtf 1 error');
                    else callback(null, db);
                });
            },
            function (db, callback) {
                log("addUser wtf 2");
                db.collection('userCollection', function (err, collection) {
                    if (err) callback(err, 'wtf 2 err');
                    else callback(null, collection);
                });
            },
            function (collection, callback) {
                log("addUser wtf 3");
                mycon.insertToDb(collection, user, function (err) {
                    if (err == null) callback(null, collection);
                    else callback(err, null);
                });
            }
        ],
            function (err, result) {
                log("addUser end");
                if (err) throw err;
                else log(result);
                db.close();
                if (!err) addUserCallback(result);
            });
    } catch (err) {
        log("addUser error");
        log(err);
        addUserCallback('addUser error occured');
    }
}

function removeUser(contraints, removeUserCallback)
{
    

}

function addCat(cat, addCatCallback)
{

}


myuser = new Object();
myuser['userid'] = '12345'
myuser['userpw'] = 'password'
myuser['userprofile'] = new Object();
myuser['userprofile']['name'] = 'TestName'
myuser['userprofile']['age'] = 'TestAge'
myuser['userinfo'] = new Object();
myuser['userinfo']['catfam'] = new Array();
myuser['userinfo']['catfam'].push('CatName1')
myuser['userinfo']['catfam'].push('CatName2')
addUser(myuser, function (result) {
    console.log(result);
})