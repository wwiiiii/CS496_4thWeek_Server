var http = require('http');
var app = http.createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var mydb = require('./communicateDB');
var server_port = 8124;
app.listen(server_port, function () { console.log('start listen');});

function handler(req, res) {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('Hello from server');
}

console.log('\n\n\n\n');

function catRand() {
    var nextTime = Math.round((Math.random() + 1) * 3600)
    console.log('next cat move is ' + String(nextTime))
    setTimeout(function () {
        mydb.catRandomWalk();
        catRand()
    }, nextTime)
}

//catRand()
io.sockets.setMaxListeners(25);
io.sockets.on('connection', function (socket) {
    socket.on('init', function (loginStatus) {
        mydb.loadUserData(loginStatus, function (err, user) {
            if (err) { console.log(err); }
            else {
                io.to(socket.id).emit('initRes', user);
                console.log('initRes to ' + socket.id);
                console.log(user);
            }
        });
        console.log('init from ' + socket.id);
        console.log('with loginStatus : ' + JSON.stringify(loginStatus));
    });

    //input  : {id : ~~, lat : ~~, lon: ~~}
    //output : 
    socket.on('heartbeat', function (data) {
        console.log('\n\n\n\n');
        console.log('heartbeat called by' + socket.id)
        console.log(JSON.stringify(data))
        var lon = Number(data.lon); var lat = Number(data.lat);
        newlocate = new Object(); newlocate['lat'] = lat; newlocate['lon'] = lon;
        var change = { userlocate : newlocate }
        mydb.loadUserData({ID:data.id}, function(err, user){
            mydb.updateUserData(data.id, change, function (err, result) {
                console.log('findNearAll called with ' + JSON.stringify(result))
                mydb.findNearAll(data, function (nearData) {
                    for (var i = 0; i < nearData.length; i++)
                    {
                        if (!nearData[i].hasOwnProperty('catName')) continue;
                        var dist = measure(lat, lon, nearData[i].catlocate.lat, nearData[i].catlocate.lon)
                        if (dist < 500) nearData[i].isNear = true;
                        else nearData[i].isNear = false;
                    }
                    io.to(socket.id).emit('heartbeatRes', nearData);
                })
            })
        })
    });

    //해당 조건에 맞는 상점 아이템들을 검색해줌
    socket.on('store', function (condition) {
        console.log('\n\n\n\n');
        console.log('store called')
        console.log(JSON.stringify(condition))
        if (!condition.hasOwnProperty('food')) condition['food'] = false
        if (!condition.hasOwnProperty('snack')) condition['snack'] = false
        if (!condition.hasOwnProperty('toy')) condition['toy'] = false
        if (!condition.hasOwnProperty('etc')) condition['etc'] = false
        mydb.findStoreItem(condition, function (err, itemData) {
            io.to(socket.id).emit('storeRes', itemData);
        })
    })

    socket.on('userInfo', function (info) {
        console.log('\n\n\n\n');
        var userid = info.ID
        mydb.loadUserData({'ID':userid}, function (err, user) {
            if (err) { console.log(err); }
            else {
                //var temparr = [{ 'catname': '치즈냥이', 'fam': 3 }, { 'catname': '아름이', 'fam': 5 }]//user.userRank
                //user.userRank = temparr
                //mydb.updateFam(userid, '치즈냥이', 10, function (err, res) {
                    io.to(socket.id).emit('userInfoRes', user);
                    console.log('userInfoRes to ' + socket.id);
                    console.log(JSON.stringify(user));
                //})
            }
        });
    })

    socket.on('catInfo', function (info) {
        console.log('\n\n\n\n');
        var catname = info.catName
        mydb.loadCatData(catname, function (err, cat) {
            if (err) { console.log(err); }
            else {
                io.to(socket.id).emit('catInfoRes', cat);
                console.log('catInfoRes to ' + socket.id);
                console.log(JSON.stringify(cat));
            }
        });
    })

    socket.on('buy', function (data) {
        console.log('\n\n\n\n');
        console.log('buy called with ' + JSON.stringify(data))
        mydb.buyItem(data.userid, data.iteminfo.itemID, data.quantity, function (err, res) {
            if (err || res == false) { console.log(err); io.to(socket.id).emit('buyRes', {'isSucceed' : false, 'error' : err}) }
            else {
                console.log('buy succeed')
                io.to(socket.id).emit('buyRes', {'isSucceed' : true, 'error' : null})
            }
        })
    })

    socket.on('useitem', function (data) {
        console.log('\n\n\n\n');
        console.log('useitem called with ' + JSON.stringify(data))
        mydb.useItem(data.userid, data.iteminfo, data.catname, 1, function (err, res) {
            if (err || res == false) { console.log(err); io.to(socket.id).emit('useitemRes', { 'isSucceed': false, 'error': err }) }
            else {
                console.log('useitem succeed')
                io.to(socket.id).emit('useitemRes', { 'isSucceed': true, 'error': null })
            }
        })
    })

    socket.on('useritem', function (data) {
        console.log('\n\n\n\n');
        console.log('getUseritem called with ' + JSON.stringify(data))
        mydb.getUserItemList(data.userid, function (err, res) {
            if (err) { console.log(err); io.to(socket.id).emit('useritemRes', err) }
            else {
                console.log('getUseritem succeed')
                console.log(JSON.stringify(res))
                io.to(socket.id).emit('useritemRes', res)
            }
        })
    })

    //여기서부터는 admin용
    socket.on('admin_addCat', function (data) {
        data.catlocate.lon = Number(data.catlocate.lon)
        data.catlocate.lat = Number(data.catlocate.lat)
        mydb.addCat(data, function () {
            io.to(socket.id).emit('admin_addCatRes', data);
            console.log(data)
        })
    });
    socket.on('admin_addStoreItem', function (data) {
        mydb.addStoreItem(data, function () {
            io.to(socket.id).emit('admin_addStoreItemRes', data);
            console.log(data)
        })
    });
    socket.on('admin_findNear', function (data) {
        var lon = Number(data.lon); var lat = Number(data.lat);
        mydb.findNearAll(data, function (nearData) {
            io.to(socket.id).emit('admin_findNearRes', nearData);
        })
    });
    socket.on('admin_findStoreItem', function (data) {
        mydb.findStoreItem(data, function (err, itemData) {
            io.to(socket.id).emit('admin_findStoreItemRes', itemData);
        })
    });


    socket.on('disconnect', function () {
        console.log('\n\n\n\n');
        console.log('disconnet');
        console.log(socket.id);
        strs = ['init', 'heartbeat', 'store', 'userInfo',
            'catInfo', 'buy', 'useritem', 'useitem',
            'admin_addCat', 'admin_addStoreItem', 'admin_findNear', 'admin_findStoreItem']
        for (var i = 0; i < strs.length; i++)
        {
            socket.removeAllListeners(strs[i])
        }
        /*socket.off('init'); socket.off('heartbeat'); socket.off('store');
        socket.off('userinfo'); socket.off('admin_addCat'); socket.off('admin_addStoreItem');
        socket.off('admin_findNear'); socket.off('admin_findStoreItem');*/
        console.log("");
    });
});




function measure(lat1, lon1, lat2, lon2) {  // generally used geo measurement function
    var R = 6378.137; // Radius of earth in KM
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d * 1000; // meters
}