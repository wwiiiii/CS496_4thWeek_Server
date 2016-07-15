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

    socket.on('init', function (data) {
        var cli = new Object();
        data = JSON.parse(data);
        clients[socket.id].fbid = data.fbid;
        clients[socket.id].name = data.name;
        io.to(socket.id).emit('initres', data);
        console.log('init');
        console.log(socket.id);
        console.log(clients[socket.id]);
        console.log(data);
        console.log(clients);
        console.log("");
    });

    socket.on('uploadPhoneContact', function (data) {
        clients[socket.id].phoneContact = data.contact;
        clients[socket.id].userid = data.user.id;
        clients[socket.id].userpw = data.user.pw;
        clients[socket.id].fbinfo = data.fbinfo;
        io.to(socket.id).emit('uploadPhoneContactres', "PhoneContact Uploaded For " + data.user.id);
    });

    socket.on('updateContact', function () {
        console.log('starts to sendContactToDb');
        mydb.sendContactToDb(clients[socket.id], function (result) {
            io.to(socket.id).emit('updateContactres', result);
        });        
    });

    socket.on('disconnect', function () {
        console.log('disconnet');
        console.log(socket.id);
        delete clients[socket.id];
        console.log("");
    });
});
