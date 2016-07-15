var server_ip = 'localhost';
var mongodb = require('mongodb');
var async = require('async');
var server = new mongodb.Server(server_ip, 27017, { auto_reconnect: true });
var log = console.log;
var db = new mongodb.Db('mydb', server);
db.open(function (err, db) {
    if (!err) {
        db.collection('widget', function (err, collection) {
            if (err) console.log(err);
            collection.remove(null, { safe: true }, function (err, result) {
                if (!err) {
                    console.log('result of remove ' + result);
                    var widget1 = {
                        title: 'first widget',
                        desc: 'this is desc',
                        prices: 14.99,
                        _id : 112233
                    };
                    var widget2 = {
                        title: 'second widget',
                        desc: 'this is desc2',
                        prices: 25.99,
                        _id : 445566
                    };
                    try {
                        async.waterfall([
                            function (callback) {
                                console.log('start first');
                                collection.insert(widget1, function (err) { callback(err);});
                            },
                            function (callback) {
                                console.log('start 2');
                                collection.insert(widget2, { safe: true }, function (err, result) {
                                    if (err) console.log(err);
                                    else console.log(result);
                                    callback(err);
                                });
                            },
                            function (callback) {
                                console.log('3');
                                collection.find({ _id: 112233 }, { fields: {title:0}}).toArray(function (err, docs) {
                                    if (err) console.log(err);
                                    else console.log('docs' + docs);
                                    collection.findOne({}, function (err, doc) { console.log(doc); callback(err);}
                                    );
                                });
                            }
                        ], function (err, result) {
                            console.log('fin');
                            if (err) throw err;
                            console.log(result);
                            db.close();
                        })

                    } catch (err) {
                        console.log('waterfall err' + err);
                    }   
            
                    
                }
                else console.log(err);
            });
        });
    }
    else console.log(err);
});