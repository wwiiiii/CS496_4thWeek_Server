module.exports = {
    addUser: addUser,
    addCat: addCat,
    removeUser: removeUser,
    removeCat: removeCat,
    loadUserData: loadUserData,
    findNearAll: findNearAll,
    findNearCats: findNearCats,
    findNearUsers: findNearUsers,
    updateUserData: updateUserData,
    findStoreItem: findStoreItem,
    addStoreItem: addStoreItem
}
//
var mycon = require('./connToMongo');
var server_ip = 'localhost';
var mongodb = require('mongodb');
var async = require('async');
var server = new mongodb.Server(server_ip, 27017, { auto_reconnect: true });
var log = console.log;

var gpsDiff = 0.5


function loadUserData(userConstraint, loadUserDataCallback)//callback 인자는 유저 데이터 JSON 정보
{
    userid = userConstraint.ID
    username = userConstraint.name
    var db = new mongodb.Db('kaistGoDB', server);
    try {
        async.waterfall([
            function (callback) {
                log("loadUserData wtf 1");
                db.open(function (err, db) {
                    if (err) return callback(err);
                    else callback(null, db);
                });
            },
            function (db, callback) {
                log("loadUserData wtf 2");
                db.collection('userCollection', function (err, collection) {
                    if (err) return callback(err);
                    else callback(null, collection);
                });
            },
            function (collection, callback) {
                log("loadUserData wtf 3");
                //console.log(userConstraint.name)
                console.log(userConstraint.id)
                mycons = {userid:userConstraint.id}
                collection.find(mycons).toArray(function (err, docs) {
                    console.log('callback called(array)')
                    if (err) {
                        console.log('loadUser - findAllFromDb error');
                        console.log(err);
                        return callback(err);
                    }
                    else {
                        console.log('loadUserFindRes')
                        console.log(JSON.stringify(docs))
                        callback(null, collection, docs);
                    }
                });
            },
            function (collection, docs, callback) {
                if (docs.length > 0) callback(null, docs[0]);
                else {
                    newuser = new Object(); newuser.userid = userid;
                    newuser.userlocate = new Object()
                    newuser.userlocate.lat = 0.0; newuser.userlocate.lon = 0.0;
                    newuser.userInfo = new Object()
                    newuser.userInfo.name = username; newuser.userInfo.money = 5000;
                    newuser.userRank = new Array()
                    newuser.userItem = new Array()

                    addUser(newuser, function(err, addres){
                        if (err != null) return callback(err, null);
                        else {
                            callback(null, newuser);
                        }
                    })
                }
            }
        ],
            function (err, result) {
                log("loadUserData end");
                if (err) throw err;
                else log(result);
                db.close();
                if (!err) loadUserDataCallback(null, result);
            });
    } catch (err) {
        log("loadUserData error");
        log(err);
        loadUserDataCallback(err, null);
    }
}

//나중에 중복 유저가 있는지 검사 루틴 추가
function addUser(user, addUserCallback) {
    var db = new mongodb.Db('kaistGoDB', server);
    try {
        async.waterfall([
            function (callback) {
                log("addUser wtf 1");
                db.open(function (err, db) {
                    if (err) return callback(err, 'wtf 1 error');
                    else callback(null, db);
                });
            },
            function (db, callback) {
                log("addUser wtf 2");
                db.collection('userCollection', function (err, collection) {
                    if (err) return callback(err, 'wtf 2 err');
                    else callback(null, collection);
                });
            },
            function (collection, callback) {
                log("addUser wtf 3");
                collection.insert(user, function (err, res) {
                    if (err) {
                        console.log('insertToDb error');
                        console.log(err);
                        return callback(err);
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
                if (!err) addUserCallback(null, result);
            });
    } catch (err) {
        log("addUser error");
        log(err);
        addUserCallback(err, null);
    }
}

function removeUser(contraints, removeUserCallback)
{
    var db = new mongodb.Db('kaistGoDB', server);
    try {
        async.waterfall([
            function (callback) {
                log("removeUser wtf 1");
                db.open(function (err, db) {
                    if (err) return callback(err, 'removeUser wtf 1 error');
                    else callback(null, db);
                });
            },
            function (db, callback) {
                log("removeUser wtf 2");
                db.collection('userCollection', function (err, collection) {
                    if (err) return callback(err, 'removeUser wtf 2 err');
                    else callback(null, collection);
                });
            },
            function (collection, callback) {
                log("removeUser wtf 3");
                /* mycon.insertToDb(collection, user, function (err) {
                     if (err == null) callback(null, collection);
                     else callback(err, null);
                 });*/
                collection.deleteMany(constraints, function (err, res) {
                    if (err) {
                        console.log('deleteMany error'); console.log(err); return callback(err);
                    } else {
                        callback(null);
                    }
                })
            }
        ],
            function (err, result) {
                log("removeUser end");
                if (err) throw err;
                else log(result);
                db.close();
                if (!err) removeUserCallback(result);
            });
    } catch (err) {
        log("removeUser error");
        log(err);
        removeUserCallback('removeUser error occured');
    }
}

function addCat(cat, addCatCallback)
{
    var db = new mongodb.Db('kaistGoDB', server);
    try {
        async.waterfall([
            function (callback) {
                log("addCat wtf 1");
                db.open(function (err, db) {
                    if (err) return callback(err, 'addCat wtf 1 error');
                    else callback(null, db);
                });
            },
            function (db, callback) {
                log("addCat wtf 2");
                db.collection('catCollection', function (err, collection) {
                    if (err) return callback(err, 'addCat wtf 2 err');
                    else callback(null, collection);
                });
            },
            function (collection, callback) {
                log("addCat wtf 3");
                collection.insert(cat, function (err, res) {
                    if (err) {
                        console.log('insertToDb error');
                        console.log(err);
                        return callback(err);
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

function removeCat(contraints, removeCatCallback) {
    var db = new mongodb.Db('kaistGoDB', server);
    try {
        async.waterfall([
            function (callback) {
                log("removeCat wtf 1");
                db.open(function (err, db) {
                    if (err) return callback(err, 'removeCat wtf 1 error');
                    else callback(null, db);
                });
            },
            function (db, callback) {
                log("removeCat wtf 2");
                db.collection('catCollection', function (err, collection) {
                    if (err) return callback(err, 'removeCat wtf 2 err');
                    else callback(null, collection);
                });
            },
            function (collection, callback) {
                log("removeCat wtf 3");
                /* mycon.insertToDb(collection, Cat, function (err) {
                     if (err == null) callback(null, collection);
                     else callback(err, null);
                 });*/
                collection.deleteMany(constraints, function (err, res) {
                    if (err) {
                        console.log('deleteMany error'); console.log(err); return callback(err);
                    } else {
                        callback(null);
                    }
                })
            }
        ],
            function (err, result) {
                log("removeCat end");
                if (err) throw err;
                else log(result);
                db.close();
                if (!err) removeCatCallback(result);
            });
    } catch (err) {
        log("removeCat error");
        log(err);
        removeCatCallback('removeCat error occured');
    }
}


function findNearAll(position, findNearAllCallback)
{
    var db = new mongodb.Db('kaistGoDB', server);
    res = []
    position.lon = Number(position.lon)
    position.lat = Number(position.lat)
    async.waterfall([
        function (callback) {
            findNearCats(position, function(errr, result){
                if (errr != null) return callback(errr)
                else callback(null, result)
            })
        },
        function(catinfo, callback){
            res = res.concat(catinfo)
            findNearUsers(position, function(errr, result){
                if (errr != null) return callback(errr)
                else callback(null, result)
            })    
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
    var db = new mongodb.Db('kaistGoDB', server);
    try {
        async.waterfall([
            function (callback) {
                log("findNearCats wtf 1");
                db.open(function (err, db) {
                    if (err) return callback(err, 'findNearCats wtf 1 error');
                    else callback(null, db);
                });
            },
            function (db, callback) {
                log("findNearCats wtf 2");
                db.collection('catCollection', function (err, collection) {
                    if (err) return callback(err, 'findNearCats wtf 2 err');
                    else callback(null, collection);
                });
            },
            function (collection, callback) {
                log("findNearCats wtf 3");
                var locateContraint = {
                    "catlocate.lon": { "$gte": position.lon - gpsDiff, "$lte": position.lon + gpsDiff },
                    "catlocate.lat": { "$gte": position.lat - gpsDiff, "$lte": position.lat + gpsDiff }
                }
                collection.find(locateContraint).toArray(function (err, docs) {
                    if (err) {
                        console.log('catFind - findAllFromDb error');
                        console.log(err);
                        if (callback != null) return callback(err);
                    }
                    else {
                        if (callback != null) callback(null, docs);
                    }
                });
            }
        ],
            function (err, result) {
                log("findNearCats end");
                if (err) throw err;
                else log(result);
                db.close();
                if (!err) findNearCatsCallback(null , result);
            });
    } catch (err) {
        log("findNearCats error");
        log(err);
        findNearCatsCallback(err, null);
    }

}

function findNearUsers(position, findNearUsersCallback)
{
    var db = new mongodb.Db('kaistGoDB', server);
    try {
        async.waterfall([
            function (callback) {
                log("findNearUsers wtf 1");
                db.open(function (err, db) {
                    if (err) return callback(err, null);
                    else callback(null, db);
                });
            },
            function (db, callback) {
                log("findNearUsers wtf 2");
                db.collection('userCollection', function (err, collection) {
                    if (err) return callback(err, null);
                    else callback(null, collection);
                });
            },
            function (collection, callback) {
                log("findNearUsers wtf 3");
                
                var locateContraint = {
                    "userlocate.lon": { "$gte": position.lon - gpsDiff, "$lte": position.lon + gpsDiff },
                    "userlocate.lat": { "$gte": position.lat - gpsDiff, "$lte": position.lat + gpsDiff }
                }
                collection.find(locateContraint).toArray(function (err, docs) {
                    if (err) {
                        console.log('UserFind - findAllFromDb error');
                        console.log(err);
                        if (callback != null) return callback(err);
                    }
                    else {
                        if (callback != null) callback(null, docs);
                    }
                });
            }
        ],
            function (err, result) {
                log("findNearUsers end");
                if (err) throw err;
                else log(result);
                db.close();
                if (!err) findNearUsersCallback(null, result);
            });
    } catch (err) {
        log("findNearUsers error");
        log(err);
        findNearUsersCallback(err, null);
    }
}

function findNearShop(position, findNearShopCallback)
{



}

function updateUserData(myid, change, updateUserDataCallback)
{
    var db = new mongodb.Db('kaistGoDB', server);
    console.log('updateUserData change with ' + JSON.stringify(change))
    try {
        async.waterfall([
            function (callback) {
                log("updateUserData wtf 1");
                db.open(function (err, db) {
                    if (err) return callback(err, 'wtf 1 error');
                    else callback(null, db);
                });
            },
            function (db, callback) {
                log("updateUserData wtf 2");
                db.collection('userCollection', function (err, collection) {
                    if (err) return callback(err, 'wtf 2 err');
                    else callback(null, collection);
                });
            },
            function (collection, callback) {
                log("updateUserData wtf 3");
                collection.update({ userid: myid }, { $set: change }, { w: 1 }, function (err, doc) {
                    if (err) {
                        console.log('updateUser error'); console.log(err); return callback(err);
                    } else { callback(null, doc); }
                })
                /*collction.findAndModify({userid: userid }, [['userid', userid]], { $set: change }, { new: true}, function (err, doc) {
                    if (err) {
                        console.log('updateUser error');
                        console.log(err);
                        callback(err);
                    } else {
                        callback(null, doc);
                    }
                })*/
            }
        ],
            function (err, result) {
                log("updateUserData end");
                if (err) throw err;
                else log(result);
                db.close();
                if (!err) updateUserDataCallback(null, result);
            });
    } catch (err) {
        log("updateUserData error");
        log(err);
        updateUserDataCallback(err, null);
    }
}

function addStoreItem(item, addStoreItemCallback) {
    var db = new mongodb.Db('kaistGoDB', server);
    try {
        async.waterfall([
            function (callback) {
                log("addStoreItem wtf 1");
                db.open(function (err, db) {
                    if (err) return callback(err, null);
                    else callback(null, db);
                });
            },
            function (db, callback) {
                log("addStoreItem wtf 2");
                db.collection('storeCollection', function (err, collection) {
                    if (err) return callback(err, null);
                    else callback(null, collection);
                });
            },
            function (collection, callback) {
                log("addStoreItem wtf 3");
                collection.insert(item, function (err, res) {
                    if (err) {
                        console.log('insertToDb error');
                        console.log(err);
                        return callback(err);
                    } else {
                        callback(null);
                    }
                });
            }
        ],
            function (err, result) {
                log("addStoreItem end");
                if (err) throw err;
                else log(result);
                db.close();
                if (!err) addStoreItemCallback(null, result);
            });
    } catch (err) {
        log("addStoreItem error");
        log(err);
        addStoreItemCallback(err, null);
    }
}

//return value is JSONArray of items
function findStoreItem(condition, findStoreItemCallback)
{
    var db = new mongodb.Db('kaistGoDB', server);
    try {
        async.waterfall([
            function (callback) {
                log("findStoreItem wtf 1");
                db.open(function (err, db) {
                    if (err) return callback(err);
                    else callback(null, db);
                });
            },
            function (db, callback) {
                log("findStoreItem wtf 2");
                db.collection('storeCollection', function (err, collection) {
                    if (err) return callback(err);
                    else callback(null, collection);
                });
            },
            function (collection, callback) {
                log("findStoreItem wtf 3");
                consArr = [];
                consArr.push({ 'itemcatalog': 'foo' })
                console.log(Boolean(conditon.food))
                console.log(Boolean(conditon.etc))
                console.log(Boolean(conditon.toy))
                console.log(Boolean(conditon.snack))
                if (Boolean(condition.food) == true) consArr.push({ 'itemcatalog': 'food' })
                if (Boolean(condition.etc) == true) consArr.push({ 'itemcatalog': 'etc' })
                if (Boolean(condition.toy) == true) consArr.push({ 'itemcatalog': 'toy' })
                if (Boolean(condition.snack) == true) consArr.push({ 'itemcatalog': 'snack' })
                var optionConstraint = new Object()
                optionConstraint['$or'] = consArr
                console.log(optionConstraint)
                collection.find(optionConstraint).toArray(function (err, docs) {
                    if (err) {
                        console.log('storeFind - findAllFromDb error');
                        console.log(err);
                        if (callback != null) return callback(err);
                    }
                    else {
                        if (callback != null) callback(null, docs);
                    }
                });
            }
        ],
            function (err, result) {
                log("findStoreItem end");
                if (err) throw err;
                else log(result);
                db.close();
                if (!err) findStoreItemCallback(null, result);
            });
    } catch (err) {
        log("findStoreItem error");
        log(err);
        findStoreItemCallback(err, null);
    }
}
/*
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
/*addUser(myuser, function (result) {
    console.log(result);
})*/
/*
mycat = new Object();
mycat['catid'] = '12345'
mycat['catpw'] = 'password'
mycat['catprofile'] = new Object();
mycat['catprofile']['name'] = 'TestName'
mycat['catprofile']['age'] = 'TestAge'
mycat['catinfo'] = new Object();
mycat['catinfo']['catfam'] = new Array();
mycat['catinfo']['catfam'].push('CatName1')
mycat['catinfo']['catfam'].push('CatName2')
mycat['catlocate'] = new Object();
mycat['catlocate']['lon'] = '143.245345';
mycat['catlocate']['lat'] = '51.243';

mypos = new Object();
mypos['lon'] = 143.245343
mypos['lat'] = 51.244
addCat(mycat, function (result) {
    console.log(result);
    findNearCats(mypos, function (docs) {
        console.log(docs);
    })
})
*/