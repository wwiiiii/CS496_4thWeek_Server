var http = require('http');
var app = http.createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var mydb = require('./communicateDB');
var clients = {};

app.listen(8124, function () { console.log('start listen');});

function handler(req, res) {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('Hello from server');
}

io.sockets.on('connection', function (socket) {
    var clie = new Object();
    clients[socket.id] = clie;

    socket.on('init', function (loginStatus) {
        loadUserData(loginStatus, function (user) {
            io.to(socket.id).emit('initRes', user);
            clients[socket.id].user = user;
            console.log('initRes to ' + socket.id);
            console.log(user);
        });
        console.log('init from ' + socket.id);
        console.log('with loginStatus : ' + loginStatus);
    });

    socket.on('heartbeat', function (data) {
        clients[socket.id].pos = data;
        fineNearAll(data, function (data) {
            io.to(socket.id).emit('heartbeatRes', data);
        })
    });

    socket.on('disconnect', function () {
        console.log('disconnet');
        console.log(socket.id);
        delete clients[socket.id];
        console.log("");
    });
});
