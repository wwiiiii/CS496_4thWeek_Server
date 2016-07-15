var http = require('http');
var app = http.createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var clients = {};
var chatlog = [];
app.listen(12345, function () { console.log('start listen');});

function handler(req, res) {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('Hello from server');
}

io.sockets.on('connection', function (socket) {
    if (clients[socket.id] == undefined) clients[socket.id] = new Object();
    socket.on('init', function (data) {
        console.log('init');
        console.log(socket.id);
        console.log(data);
        console.log(clients);
        console.log("");
        clients[socket.id].myid = data;
        io.to(socket.id).emit('init', chatlog);
        socket.broadcast.emit('otherChat', data + " has joined.");
        chatlog.push(data + " has joined.");
    });
    socket.on('myChat', function (data) {
        console.log(clients[socket.id].myid);
        var chat = clients[socket.id].myid +": "+ data.content;
        socket.broadcast.emit("otherChat", chat);
        console.log(data.content);
        chatlog.push(chat);
    });

    socket.on('disconnect', function () {
        console.log('disconnet');
        console.log(socket.id);
        delete clients[socket.id];
        console.log("");
    });
});
