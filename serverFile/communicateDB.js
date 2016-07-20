﻿module.exports = {
    addUser: addUser,
    addCat: addCat,
    removeUser: removeUser,
    removeCat: removeCat,
    loadUserData: loadUserData,
    loadCatData: loadCatData,
    findNearAll: findNearAll,
    findNearCats: findNearCats,
    findNearUsers: findNearUsers,
    updateUserData: updateUserData,
    findStoreItem: findStoreItem,
    addStoreItem: addStoreItem,
    buyItem: buyItem,
    findItemByID: findItemByID,
    updateFam: updateFam,
    useItem: useItem,
    catRandomWalk: catRandomWalk,
    getUserItemList: getUserItemList
}
//
var mycon = require('./connToMongo');
var server_ip = 'localhost';
var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var async = require('async');
var server = new mongodb.Server(server_ip, 27017, { auto_reconnect: true });
var log = console.log;
var gpsDiff = 0.5
var db = ''
var isVerbose = false
var showWaterfallLog = false

MongoClient.connect("mongodb://localhost:27017/kaistGoDB", function (err, firstdb) {
    if(err) return console.log('First open error')
    db = firstdb
})

function loadUserData(userConstraint, loadUserDataCallback)//callback 인자는 유저 데이터 JSON 정보
{
    userid = 'None'; username = 'None';
    if (userConstraint.hasOwnProperty('ID')) userid = userConstraint.ID
    if (userConstraint.hasOwnProperty('id')) userid = userConstraint.id
    if (userConstraint.hasOwnProperty('userid')) userid = userConstraint.userid
    if (userConstraint.hasOwnProperty('name')) username = userConstraint.name

    console.log('id and name is ')
    console.log(userid)
    console.log(username)
    ////MongoClient.connect("mongodb://localhost:27017/kaistGoDB", function (errR, db) {
        ////if(errR) return console.log(errR)
        try {
            async.waterfall([
                function (callback) {
                    if (showWaterfallLog == true) log("loadUserData wtf 1");
                    db.open(function (err, db) {
                        if (err) return callback(err);
                        else callback(null, db);
                    });
                },
                function (db, callback) {
                    if (showWaterfallLog == true) log("loadUserData wtf 2");
                    db.collection('userCollection', function (err, collection) {
                        if (err) return callback(err);
                        else callback(null, collection);
                    });
                },
                function (collection, callback) {
                    if (showWaterfallLog == true) log("loadUserData wtf 3");
                    //console.log(userConstraint.name)
                    //console.log(userConstraint.id)
                    //mycons = { userid: userConstraint.id }
                    mycons = { 'userid': userid}
                    collection.find(mycons).toArray(function (err, docs) {
                        console.log('callback called(array)')
                        if (err) {
                            console.log('loadUser - findAllFromDb error');
                            console.log(err);
                            return callback(err);
                        }
                        else {
                            if(isVerbose == true)console.log('loadUserFindRes')
                            if (isVerbose == true) console.log(JSON.stringify(docs))
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
                        newuser.userInfo.name = username; newuser.userInfo.money = 50000;
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
                    if (showWaterfallLog == true) log("loadUserData end");
                    if (err) throw err;
                    else if (isVerbose == true) log(result);
                    //db.close();
                    if (!err) loadUserDataCallback(null, result);
                });
        } catch (err) {
            log("loadUserData error");
            log(err);
            loadUserDataCallback(err, null);
        }
   // })
}


//callback 인자는 고양이 object
function loadCatData(catname, loadCatDataCallback)
{
    //MongoClient.connect("mongodb://localhost:27017/kaistGoDB", function (errR, db) {
    //if(errR) return console.log(errR)
    try {
        async.waterfall([
            function (callback) {
                if (showWaterfallLog == true) log("loadCatData wtf 1");
                db.open(function (err, db) {
                    if (err) return callback(err, 'loadCatData wtf 1 error');
                    else callback(null, db);
                });
            },
            function (db, callback) {
                if (showWaterfallLog == true) log("loadCatData wtf 2");
                db.collection('catCollection', function (err, collection) {
                    if (err) return callback(err, 'loadCatData wtf 2 err');
                    else callback(null, collection);
                });
            },
            function (collection, callback) {
                if (showWaterfallLog == true) log("loadCatData wtf 3");
                var nameConstraint = {
                    "catName" : catname
                }
                collection.find(nameConstraint).toArray(function (err, docs) {
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
                log("loadCatData end");
                if (err) throw err;
                else if (isVerbose == true) log(result);
                //db.close();
                if (!err) loadCatDataCallback(null, result[0]);
            });
    } catch (err) {
        log("loadCatData error");
        log(err);
        loadCatDataCallback(err, null);
    }
    // })

}


//나중에 중복 유저가 있는지 검사 루틴 추가
function addUser(user, addUserCallback) {
    //MongoClient.connect("mongodb://localhost:27017/kaistGoDB", function (errR, db) {
    //if(errR) return console.log(errR)
    console.log('add new user');
    if (isVerbose == true) console.log(JSON.stringify(user));
        try {
            async.waterfall([
                function (callback) {
                    if (showWaterfallLog == true) log("addUser wtf 1");
                    db.open(function (err, db) {
                        if (err) return callback(err, 'wtf 1 error');
                        else callback(null, db);
                    });
                },
                function (db, callback) {
                    if (showWaterfallLog == true) log("addUser wtf 2");
                    db.collection('userCollection', function (err, collection) {
                        if (err) return callback(err, 'wtf 2 err');
                        else callback(null, collection);
                    });
                },
                function (collection, callback) {
                    if (showWaterfallLog == true) log("addUser wtf 3");
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
                    if (showWaterfallLog == true) log("addUser end");
                    if (err) throw err;
                    else if (isVerbose == true) log(result);
                    //db.close();
                    if (!err) addUserCallback(null, result);
                });
        } catch (err) {
            log("addUser error");
            log(err);
            addUserCallback(err, null);
        }
   // })
}

function removeUser(constraints, removeUserCallback)
{
    //MongoClient.connect("mongodb://localhost:27017/kaistGoDB", function (errR, db) {
        //if(errR) return console.log(errR)
        try {
            async.waterfall([
                function (callback) {
                    if (showWaterfallLog == true) log("removeUser wtf 1");
                    db.open(function (err, db) {
                        if (err) return callback(err, 'removeUser wtf 1 error');
                        else callback(null, db);
                    });
                },
                function (db, callback) {
                    if (showWaterfallLog == true) log("removeUser wtf 2");
                    db.collection('userCollection', function (err, collection) {
                        if (err) return callback(err, 'removeUser wtf 2 err');
                        else callback(null, collection);
                    });
                },
                function (collection, callback) {
                    if (showWaterfallLog == true) log("removeUser wtf 3");
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
                    if (showWaterfallLog == true) log("removeUser end");
                    if (err) throw err;
                    else if (isVerbose == true) log(result);
                    //db.close();
                    if (!err) removeUserCallback(result);
                });
        } catch (err) {
            log("removeUser error");
            log(err);
            removeUserCallback('removeUser error occured');
        }
   // })
}

function addCat(cat, addCatCallback)
{
    //MongoClient.connect("mongodb://localhost:27017/kaistGoDB", function (errR, db) {
        //if(errR) return console.log(errR)
        try {
            async.waterfall([
                function (callback) {
                    if (showWaterfallLog == true) log("addCat wtf 1");
                    db.open(function (err, db) {
                        if (err) return callback(err, 'addCat wtf 1 error');
                        else callback(null, db);
                    });
                },
                function (db, callback) {
                    if (showWaterfallLog == true) log("addCat wtf 2");
                    db.collection('catCollection', function (err, collection) {
                        if (err) return callback(err, 'addCat wtf 2 err');
                        else callback(null, collection);
                    });
                },
                function (collection, callback) {
                    if (showWaterfallLog == true) log("addCat wtf 3");
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
                    if (showWaterfallLog == true) log("addCat end");
                    if (err) throw err;
                    else if(isVerbose == true) log(result);
                    //db.close();
                    if (!err) addCatCallback(result);
                });
        } catch (err) {
            log("addCat error");
            log(err);
            addCatCallback('addCat error occured');
        }
    //})
}

function removeCat(constraints, removeCatCallback) {
    //MongoClient.connect("mongodb://localhost:27017/kaistGoDB", function (errR, db) {
        //if(errR) return console.log(errR)
        try {
            async.waterfall([
                function (callback) {
                    if (showWaterfallLog == true) log("removeCat wtf 1");
                    db.open(function (err, db) {
                        if (err) return callback(err, 'removeCat wtf 1 error');
                        else callback(null, db);
                    });
                },
                function (db, callback) {
                    if (showWaterfallLog == true) log("removeCat wtf 2");
                    db.collection('catCollection', function (err, collection) {
                        if (err) return callback(err, 'removeCat wtf 2 err');
                        else callback(null, collection);
                    });
                },
                function (collection, callback) {
                    if (showWaterfallLog == true) log("removeCat wtf 3");
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
                    if (showWaterfallLog == true) log("removeCat end");
                    if (err) throw err;
                    else if (isVerbose == true) log(result);
                    //db.close();
                    if (!err) removeCatCallback(result);
                });
        } catch (err) {
            log("removeCat error");
            log(err);
            removeCatCallback('removeCat error occured');
        }
    //})
}


function findNearAll(position, findNearAllCallback)
{
    //MongoClient.connect("mongodb://localhost:27017/kaistGoDB", function (errR, db) {
        //if(errR) return console.log(errR)
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
    //})
}

function findNearCats(position, findNearCatsCallback)//callback 인자는 주변 고양이들 정보
{
    //MongoClient.connect("mongodb://localhost:27017/kaistGoDB", function (errR, db) {
        //if(errR) return console.log(errR)
        try {
            async.waterfall([
                function (callback) {
                    if (showWaterfallLog == true) log("findNearCats wtf 1");
                    db.open(function (err, db) {
                        if (err) return callback(err, 'findNearCats wtf 1 error');
                        else callback(null, db);
                    });
                },
                function (db, callback) {
                    if (showWaterfallLog == true) log("findNearCats wtf 2");
                    db.collection('catCollection', function (err, collection) {
                        if (err) return callback(err, 'findNearCats wtf 2 err');
                        else callback(null, collection);
                    });
                },
                function (collection, callback) {
                    if (showWaterfallLog == true) log("findNearCats wtf 3");
                    var locateConstraint = {
                        "catlocate.lon": { "$gte": position.lon - gpsDiff, "$lte": position.lon + gpsDiff },
                        "catlocate.lat": { "$gte": position.lat - gpsDiff, "$lte": position.lat + gpsDiff }
                    }
                    collection.find(locateConstraint).toArray(function (err, docs) {
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
                    if (showWaterfallLog == true) log("findNearCats end");
                    if (err) throw err;
                    else if (isVerbose == true) log(result);
                    //db.close();
                    if (!err) findNearCatsCallback(null , result);
                });
        } catch (err) {
            log("findNearCats error");
            log(err);
            findNearCatsCallback(err, null);
        }
   // })

}

function findNearUsers(position, findNearUsersCallback)
{
    //MongoClient.connect("mongodb://localhost:27017/kaistGoDB", function (errR, db) {
        //if(errR) return console.log(errR)
        try {
            async.waterfall([
                function (callback) {
                    if (showWaterfallLog == true) log("findNearUsers wtf 1");
                    db.open(function (err, db) {
                        if (err) return callback(err, null);
                        else callback(null, db);
                    });
                },
                function (db, callback) {
                    if (showWaterfallLog == true) log("findNearUsers wtf 2");
                    db.collection('userCollection', function (err, collection) {
                        if (err) return callback(err, null);
                        else callback(null, collection);
                    });
                },
                function (collection, callback) {
                    if (showWaterfallLog == true) log("findNearUsers wtf 3");
                
                    var locateConstraint = {
                        "userlocate.lon": { "$gte": position.lon - gpsDiff, "$lte": position.lon + gpsDiff },
                        "userlocate.lat": { "$gte": position.lat - gpsDiff, "$lte": position.lat + gpsDiff }
                    }
                    collection.find(locateConstraint).toArray(function (err, docs) {
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
                    if (showWaterfallLog == true) log("findNearUsers end");
                    if (err) throw err;
                    else if (isVerbose == true) log(result);
                    //db.close();
                    if (!err) findNearUsersCallback(null, result);
                });
        } catch (err) {
            log("findNearUsers error");
            log(err);
            findNearUsersCallback(err, null);
        }
    //})
}

function findNearShop(position, findNearShopCallback)
{



}

function updateUserData(myid, change, updateUserDataCallback)
{
    //MongoClient.connect("mongodb://localhost:27017/kaistGoDB", function (errR, db) {
        //if(errR) return console.log(errR)
        console.log('updateUserData change with ' + JSON.stringify(change))
        try {
            async.waterfall([
                function (callback) {
                    if (showWaterfallLog == true) log("updateUserData wtf 1");
                    db.open(function (err, db) {
                        if (err) return callback(err, 'wtf 1 error');
                        else callback(null, db);
                    });
                },
                function (db, callback) {
                    if (showWaterfallLog == true) log("updateUserData wtf 2");
                    db.collection('userCollection', function (err, collection) {
                        if (err) return callback(err, 'wtf 2 err');
                        else callback(null, collection);
                    });
                },
                function (collection, callback) {
                    if (showWaterfallLog == true) log("updateUserData wtf 3");
                    collection.update({ userid: myid }, { $set: change }, { w: 1 }, function (err, doc) {
                        if (err) {
                            console.log('updateUser error'); console.log(err); return callback(err);
                        } else { callback(null, doc); }
                    })
                }
            ],
                function (err, result) {
                    if (showWaterfallLog == true) log("updateUserData end");
                    if (err) throw err;
                    else if (isVerbose == true) log(result['result']);
                    //db.close();
                    if (!err) updateUserDataCallback(null, result);
                });
        } catch (err) {
            log("updateUserData error");
            log(err);
            updateUserDataCallback(err, null);
        }
   // })
}

function updateCatData(catname, change, updateCatDataCallback) {
    //MongoClient.connect("mongodb://localhost:27017/kaistGoDB", function (errR, db) {
    //if(errR) return console.log(errR)
    console.log('updateCatData change with ' + JSON.stringify(change))
    try {
        async.waterfall([
            function (callback) {
                if (showWaterfallLog == true) log("updateCatData wtf 1");
                db.open(function (err, db) {
                    if (err) return callback(err, 'wtf 1 error');
                    else callback(null, db);
                });
            },
            function (db, callback) {
                if (showWaterfallLog == true) log("updateCatData wtf 2");
                db.collection('catCollection', function (err, collection) {
                    if (err) return callback(err, 'wtf 2 err');
                    else callback(null, collection);
                });
            },
            function (collection, callback) {
                if (showWaterfallLog == true) log("updateCatData wtf 3");
                collection.update({ 'catName': catname }, { $set: change }, { w: 1 }, function (err, doc) {
                    if (err) {
                        console.log('updateCat error'); console.log(err); return callback(err);
                    } else { callback(null, doc); }
                })
            }
        ],
            function (err, result) {
                if (showWaterfallLog == true) log("updateCatData end");
                if (err) throw err;
                else if (isVerbose == true) log(result['result']);
                //db.close();
                if (!err) updateCatDataCallback(null, result);
            });
    } catch (err) {
        log("updateCatData error");
        log(err);
        updateCatDataCallback(err, null);
    }
    // })
}


function addStoreItem(item, addStoreItemCallback) {
    //MongoClient.connect("mongodb://localhost:27017/kaistGoDB", function (errR, db) {
        //if(errR) return console.log(errR)
        try {
            async.waterfall([
                function (callback) {
                    if (showWaterfallLog == true) log("addStoreItem wtf 1");
                    db.open(function (err, db) {
                        if (err) return callback(err, null);
                        else callback(null, db);
                    });
                },
                function (db, callback) {
                    if (showWaterfallLog == true) log("addStoreItem wtf 2");
                    db.collection('storeCollection', function (err, collection) {
                        if (err) return callback(err, null);
                        else callback(null, collection);
                    });
                },
                function (collection, callback) {
                    if (showWaterfallLog == true) log("addStoreItem wtf 3");
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
                    if (showWaterfallLog == true) log("addStoreItem end");
                    if (err) throw err;
                    else if (isVerbose == true) log(result);
                    //db.close();
                    if (!err) addStoreItemCallback(null, result);
                });
        } catch (err) {
            log("addStoreItem error");
            log(err);
            addStoreItemCallback(err, null);
        }
    //})
}

//return value is JSONArray of items
function findStoreItem(condition, findStoreItemCallback)
{
    //MongoClient.connect("mongodb://localhost:27017/kaistGoDB", function (errR, db) {
        //if(errR) return console.log(errR)
        try {
            async.waterfall([
                /*function (callback) {
                    log("findStoreItem wtf 1");
                    db.open(function (err, db) {
                        if (err) return callback(err);
                        else callback(null, db);
                    });
                },*/
                function (callback) {
                    if (showWaterfallLog == true) log("findStoreItem wtf 2");
                    db.collection('storeCollection', function (err, collection) {
                        if (err) return callback(err);
                        else callback(null, collection);
                    });
                },
                function (collection, callback) {
                    if (showWaterfallLog == true) log("findStoreItem wtf 3");
                    consArr = [];
                    consArr.push({ 'itemcatalog': 'foo' })
                    try {
                        if (Boolean(condition.food) == true) consArr.push({ 'itemcatalog': 'food' })
                        if (Boolean(condition.etc) == true) consArr.push({ 'itemcatalog': 'etc' })
                        if (Boolean(condition.toy) == true) consArr.push({ 'itemcatalog': 'toy' })
                        if (Boolean(condition.snack) == true) consArr.push({ 'itemcatalog': 'snack' })
                        var optionConstraint = new Object()
                        optionConstraint['$or'] = consArr
                        if (isVerbose == true) console.log(optionConstraint)
                    } catch (err) { console.log('wtf 3 err'); console.log(err);}
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
                    if (showWaterfallLog == true) log("findStoreItem end");
                    if (err) throw err;
                    else if (isVerbose == true) log(result);
                    //db.close();
                    if (!err) findStoreItemCallback(null, result);
                });
        } catch (err) {
            log("findStoreItem error");
            log(err);
            findStoreItemCallback(err, null);
        }
    //})
}



function findItemByID(itemID, findItemByIDCallback)
{
    try {
        async.waterfall([
            function (callback) {
                if (showWaterfallLog == true) log("findItemByID wtf 2");
                db.collection('storeCollection', function (err, collection) {
                    if (err) return callback(err);
                    else callback(null, collection);
                });
            },
            function (collection, callback) {
                if (showWaterfallLog == true) log("findItemByID wtf 3");
                collection.find({'itemID':String(itemID)}).toArray(function (err, docs) {
                    if (err) {
                        console.log('findByItemID error');
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
                if (showWaterfallLog == true) log("findItemByID end");
                if (err) throw err; else if (isVerbose == true) log(result);
                if (!err) findItemByIDCallback(null, result[0]);
            });
    } catch (err) {
        log("findItemByID error");
        log(err);
        findItemByIDCallback(err, null);
    }
} 

//유저 정보 로딩 -> 아이템 정보 로딩 -> 구매 가능한지 판단 -> 가능하면 정보 업데이트
function buyItem(userid, itemid, cnt, buyItemCallback)
{
    finres = true
    console.log(String(userid) + ' '+String(itemid) + ' '+String(cnt))
    try {
        async.waterfall([
            function (callback) {
                if (showWaterfallLog == true) log("buyItem wtf 1");//find user info
                db.collection('userCollection', function (err, collection) {
                    if (err) return callback(err);
                    else {
                        collection.find({ 'userid': userid }).toArray(function (err, docs) {
                            if (err) return callback(err);
                            else if (docs.length == 0) return callback(null,null);
                            else {
                                callback(null, docs[0]);
                            }
                        })
                    }
                });
            },
            function (user, callback) {
                if (showWaterfallLog == true) log("buyItem wtf 2");
                findItemByID(itemid, function (err, item) {
                    if (err) return callback(err);
                    else callback(null, user, item)
                });
            },
            function (user, item, callback) {
                if (showWaterfallLog == true) log('buyItem wtf 3');
                /*if (isVerbose == true)*/ console.log('user is ' + JSON.stringify(user))
                /*if (isVerbose == true)*/ console.log('item is ' + JSON.stringify(item))
                if (user != null) {
                    var nowmoney = Number(user.userInfo.money)
                    var targetmoney = Number(item.itemcost) * Number(cnt)
                    if (nowmoney < targetmoney) {
                        callback(null, false)
                    } else {
                        itemarr = user.userItem; var flag = false
                        for (var i = 0; i < itemarr.length; i++) {
                            if (itemarr[i]['itemID'] == itemid) {
                                itemarr[i]['itemcnt'] = Number(itemarr[i]['itemcnt']) + Number(cnt);
                                flag = true
                            }
                        }
                        if (flag == false) {
                            var temp = item; temp['itemcnt'] = Number(cnt)
                            itemarr.push(temp)
                        }
                        finres = true
                        updateUserData(userid, { 'userInfo.money': nowmoney - targetmoney, 'userItem': itemarr }, function (err, res) {
                            if (err) return callback(err);
                            else callback(null, finres)
                        })
                    }
                } else callback(null, false);
            }
        ],
            function (err, result) {
                if (showWaterfallLog == true) log("buyItem end");
                if (err) throw err; else if (isVerbose == true) log(result);
                if (!err) buyItemCallback(null, result);
            });
    } catch (err) {
        log("buyItem error");
        log(err);
        buyItemCallback(err, null);
    }
}


function updateFam(userid, catname, famChange, updateFamCallback)
{ 
    try {
        async.waterfall([
            function (callback) {
                if (showWaterfallLog == true) log("updateFam wtf 1");//find user info
                db.collection('userCollection', function (err, collection) {
                    if (err) return callback(err);
                    else {
                        collection.find({ 'userid': userid }).toArray(function (err, docs) {
                            if (err) return callback(err);
                            else if (docs.length == 0) return callback(null,null);
                            else {
                                callback(null, docs[0]);
                            }
                        })
                    }
                });
            },
            function (user, callback) {
                if (showWaterfallLog == true) log("updateFam wtf 2");
                db.collection('catCollection', function (err, collection) {
                    if (err) return callback(err);
                    else {
                        collection.find({ 'catName': catname }).toArray(function (err, docs) {
                            if (err) return callback(err);
                            else if (docs.length == 0) return callback(null, null);
                            else {
                                callback(null, user, docs[0]);
                            }
                        })
                    }
                });
            },
            function (user, cat, callback) {
                if (showWaterfallLog == true) log('updateFam wtf 3');
                if (user != null && cat != null) {
                    if (isVerbose == true) console.log('user is ' + JSON.stringify(user))
                    if (isVerbose == true) console.log('cat is ' + JSON.stringify(cat))
                    userarr = user.userRank; userexist = false;
                    catarr = cat.catRank; catexist = false; useridx = -1;
                    for (var i = 0; i < userarr.length; i++)
                    {
                        if (userarr[i]['catname'] == catname)
                        {
                            userarr[i]['fam'] = userarr[i]['fam'] + Number(famChange)
                            userexist = true; useridx = i;break;
                        }
                    }
                    if (userexist == false){
                        userarr.push({ "catname": catname, "fam": Number(famChange) })
                        useridx = userarr.length - 1;
                    }
                    for (var i = 0; i < catarr.length; i++) {
                        if (catarr[i]['userid'] == userid) {
                            catarr[i]['fam'] = catarr[i]['fam'] + Number(famChange)
                            catexist = true; break;
                        }
                    }
                    if (catexist == false) {
                        catarr.push({ "userid": userid, "fam": Number(famChange), "username" : user.userInfo.name })
                    }
                    catarr.sort(function (a, b) {
                        var keya = Number(a.fam); var keyb = Number(b.fam);
                        if (keya > keyb) return -1;
                        if (keya < keyb) return 1;
                        return 0;
                    })
                    for (var i = 0; i < catarr.length; i++)
                    {
                        catarr[i]['rank'] = i + 1;
                        if (catarr[i]['userid'] == userid)
                        {
                            userarr[useridx]['rank'] = i + 1;
                        }
                    }
                    updateUserData(userid, { 'userRank': userarr}, function (err, res) {
                        if (err) return callback(err);
                        else {
                            updateCatData(catname, { 'catRank': catarr }, function (errr, res) {
                                if (errr) return callback(errr);
                                else callback(null, 'update fam succeed');
                            })
                        }
                    })
                } else callback(null, null)
            }
        ],
            function (err, result) {
                if (showWaterfallLog == true) log("updateFam end");
                if (err) throw err; else if(isVerbose == true) log(result);
                if (!err) updateFamCallback(null, result);
            });
    } catch (err) {
        log("updateFam error");
        log(err);
        updateFamCallback(err, null);
    }
}

function useItem(userid, itemid, catname, cnt, useItemCallback)
{
    isItemUsed = false
    try {
        async.waterfall([
            function (callback) {
                if (showWaterfallLog == true) log("useItem wtf 1");//find user info
                db.collection('userCollection', function (err, collection) {
                    if (err) return callback(err);
                    else {
                        collection.find({ 'userid': userid }).toArray(function (err, docs) {
                            if (err) return callback(err);
                            else if (docs.length == 0) return callback(null, null);
                            else {
                                callback(null, docs[0]);
                            }
                        })
                    }
                });
            },
            function (user, callback) {
                if (showWaterfallLog == true) log("useItem wtf 2");
                findItemByID(itemid, function (err, item) {
                    if (err) return callback(err);
                    else callback(null, user, item)
                });
            },
            function(user, item, callback){
                if (showWaterfallLog == true) log('useItem wtf 2.5');
                db.collection('catCollection', function (err, collection) {
                    if (err) return callback(err);
                    else {
                        collection.find({ 'catName': catname }).toArray(function (err, docs) {
                            if (err) return callback(err);
                            else if (docs.length == 0) return callback(null, null);
                            else {
                                callback(null, user, item, docs[0]);
                            }
                        })
                    }
                });
            },
            function (user, item, cat, callback) {
                if (showWaterfallLog == true) log('useItem wtf 3');
                if (isVerbose == true) console.log('user is ' + JSON.stringify(user))
                if (isVerbose == true) console.log('item is ' + JSON.stringify(item))
                if (user != null && item != null && cat != null) {
                    itemarr = user.userItem; var flag = false; var eff = 0; var itemidx = -1;
                    for (var i = 0; i < itemarr.length; i++) {
                        if (itemarr[i]['itemID'] == itemid) {
                            if (Number(itemarr[i]['itemcnt']) < cnt) break;
                            //아이템 수량 조정 부분
                            itemarr[i]['itemcnt'] = Number(itemarr[i]['itemcnt']) - Number(cnt);
                            isItemUsed = true; eff = itemarr[i]['efficacy']; itemidx = i;
                        }
                    }
                    if (isItemUsed == true) {
                        //효과 적용 부분
                        if (itemarr[itemidx]['itemcatalog'] != 'food' && itemarr[itemidx]['itemcatalog'] != 'snack') {
                            updateFam(userid, catname, Number(eff), function (erruF, res) {
                                if (erruF) return callback(erruF);
                                updateUserData(userid, { 'userItem': itemarr }, function (err, res) {
                                    if (err) return callback(err);
                                    else callback(null, true)
                                })
                            })
                        } else {
                            var mealTimeChange = Number(new Date().getTime()) - Number(cat['catstatus']['lastMealTime'])
                            var newSatiety = Number(cat['catstatus']['satiety']) - Math.round(mealTimeChange)
                            if (newSatiety < 0) newSatiety = 0;
                            eff = (1.1 - newSatiety / 100) * eff;
                            if (item['itemcatalog'] == 'food') newSatiety += 40
                            if (item['itemcatalog'] == 'snack') newSatiety += 20
                            if (newSatiety > 100) newSatiety = 100;
                            updateCatData(catname, { 'catstatus.satiety': newSatiety, 'catstatus.lastMealTime': Number(new Date().getTime()) }, function (err1, res) {
                                if (err1) return callback(err1);
                                updateFam(userid, catname, Math.round(Number(eff)), function (erruF, res) {
                                    if (erruF) return callback(erruF);
                                    updateUserData(userid, { 'userItem': itemarr }, function (err, res) {
                                        if (err) return callback(err);
                                        else callback(null, true);
                                    })
                                })
                            })
                            
                        }
                    } else callback(null, false)
                } else callback(null, false);
            }
        ],
            function (err, result) {
                if (showWaterfallLog == true) log("useItem end");
                if (err) throw err; else if (isVerbose == true) log(result);
                if (!err) useItemCallback(null, result);
            });
    } catch (err) {
        log("useItem error");
        log(err);
        useItemCallback(err, null);
    }
}

function getUserItemList(userid, getUserItemListCallback)
{
    var ITEM_COUNT = 8;
    loadUserData({ 'id': userid }, function (err, user) {
        if (err) getUserItemListCallback(err, null)
        else {
            itemArr = []; itemArrRes = [];
            for (var i = 0; i < ITEM_COUNT; i++)
            {itemArr.push(0);}
            for (var i = 0; i < user['userItem'].length; i++)
            {
                itemArr[Number(user['userItem'][i]['itemID']) - 1] = Number(user['userItem'][i]['itemcnt'])
            }
            for (var i = 0; i < ITEM_COUNT; i++)
            {
                temp = new Object(); temp[String(i + 1)] = itemArr[i]
                itemArrRes.push(temp)
            }
            getUserItemListCallback(null, itemArrRes)
        }
    })
}

function catRandomWalk()
{
    console.log('catRandomWalk')
    db.collection('catCollection', function (err, collection) {
        if (err) return console.log(err);
        else {
            collection.find().toArray(function (err, docs) {
                if (err) return console.log(err);
                for (var i = 0; i < docs.length; i++)
                {
                    var pastpos = docs[i].catlocate;
                    pastpos.lon += (Math.random() * 0.0001)
                    pastpos.lat += (Math.random() * 0.0001)
                    updateCatData(docs[i]['catName'], { 'catlocate': pastpos }, function (err, res) {});
                }
            })
        }
    });
}