var socketio = require("socket.io"),
    express = require('express'),
    routes = require('./routes'),
    moment = require("moment"),
    assert = require("assert"),
    mqtt = require('./mqtt'),
    http = require("http"),
    path = require("path"),
    log = console.log;

var app = express();
var server = http.createServer(app);
var io = socketio.listen(server);

app.use(express.static('public'));
routes(app, this);

var sockets = [];
var broadcast = function(event, data) {
    sockets.forEach(function(socket) {
        socket.emit(event, data);
    });
};

var initSocket = function(socket) {
    log("New client")
    sockets.push(socket);
    socket.on("disconnect", () => {
        sockets.splice(sockets.indexOf(socket), 1);
    });
    socket.on("drive", (a, b) => {
        mqtt.mqtt_send_drive(a, b);
    });
}

server.listen(3000, () => {
    log('API server started on port ' + server.address().port);
    io.on("connection", (s) => {
        initSocket(s)
    });
});