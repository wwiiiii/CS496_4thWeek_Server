var http = require('http');
var app = http.createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var mydb = require('./communicateDB');
var clients = {};
var server_port = 8124;
app.listen(server_port, function () { console.log('start listen');});

function handler(req, res) {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('Hello from server');
}

io.sockets.on('connection', function (socket) {
    var clie = new Object();
    clients[socket.id] = clie;

    socket.on('init', function (loginStatus) {
        //console.log(loginStatus.id=='923825431078555')
        mydb.loadUserData(loginStatus, function (err, user) {
            if (err) { console.log(err); }
            else {
                io.to(socket.id).emit('initRes', user);
                clients[socket.id].user = user;
                console.log('initRes to ' + socket.id);
                console.log(user);
            }
        });
        console.log('init from ' + socket.id);
        console.log('with loginStatus : ' + JSON.stringify(loginStatus));
    });

    socket.on('heartbeat', function (data) {
        var lon = Number(data.lon); var lat = Number(data.lat);
        clients[socket.id].user.userlocate.lat = lat;
        clients[socket.id].user.userlocate.lon = lon;
        var change = {'userlocate.lat':lat, 'userlocate.lon':lon}
        mydb.updateUserData(clients[socket.id].user.userid, change, function (result) {
            mydb.fineNearAll(data, function (nearData) {
                io.to(socket.id).emit('heartbeatRes', nearData);
            })
        })
    });

    socket.on('admin_addCat', function (data) {
        data.catlocate.lon = Number(data.catlocate.lon)
        data.catlocate.lat = Number(data.catlocate.lat)
        mydb.addCat(data, function () {
            io.to(socket.id).emit('admin_addCatRes', data);
            console.log(data)
        })
    });

    socket.on('admin_findNear', function (data) {
        var lon = Number(data.lon); var lat = Number(data.lat);
        mydb.findNearAll(data, function (nearData) {
            io.to(socket.id).emit('admin_findNearRes', nearData);
        })
    });


    socket.on('disconnect', function () {
        console.log('disconnet');
        console.log(socket.id);
        delete clients[socket.id];
        console.log("");
    });
});
