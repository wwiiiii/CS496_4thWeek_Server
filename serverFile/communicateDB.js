﻿module.exports = {
    addUser: addUser,
    addCat: addCat,
    removeUser: removeUser,
    removeCat: removeCat
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
               /* mycon.insertToDb(collection, user, function (err) {
                    if (err == null) callback(null, collection);
                    else callback(err, null);
                });*/
                collection.insert(user, function (err, res) {
                    if (err) {
                        console.log('insertToDb error');
                        console.log(err);
                        callback(err);
                    } else {
                        callback(null);
                    }
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
    try {
        async.waterfall([
            function (callback) {
                log("addCat wtf 1");
                db.open(function (err, db) {
                    if (err) callback(err, 'addCat wtf 1 error');
                    else callback(null, db);
                });
            },
            function (db, callback) {
                log("addCat wtf 2");
                db.collection('catCollection', function (err, collection) {
                    if (err) callback(err, 'addCat wtf 2 err');
                    else callback(null, collection);
                });
            },
            function (collection, callback) {
                log("addCat wtf 3");
                collection.insert(cat, function (err, res) {
                    if (err) {
                        console.log('insertToDb error');
                        console.log(err);
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            }
        ],
            function (err, result) {
                log("addCat end");
                if (err) throw err;
                else log(result);
                db.close();
                if (!err) addCatCallback(result);
            });
    } catch (err) {
        log("addCat error");
        log(err);
        addCatCallback('addCat error occured');
    }
}

function loadUserData(constraint, loadUserDataCallback)//callback 인자는 유저 데이터 JSON 정보
{



}

function findNearAll(position, findNearAllCallback)
{
    res = []
    async.waterfall([
        function (callback) {
            findNearCats(position, callback)
        },
        function(catinfo, callback){
            res = res.concat(catinfo)
            findNearUsers(position, callback)    
        },
        function (userinfo, callback) {
            res = res.concat(userinfo)
            callback(null);
        }
        ],function(err, resu){
            if (err) { console.log('findNearAll err : ' + err); findNearAllCallback(null); }
            else findNearAllCallback(res);
        });
}

function findNearCats(position, findNearCatsCallback)//callback 인자는 주변 고양이들 정보
{


}

function findNearUsers(position, findNearUsersCallback)
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