var debug = require('debug')('nodejs-regular-webapp2:server'),
    socketio = require("socket.io"),
    express = require('express'),
    assert = require("assert"),
    mqtt = require('./mqtt'),
    http = require('http'),
    app = require('./app');

require('./server.1.js');

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

var server = http.createServer(app);
var io = socketio.listen(server);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port))
        return val;
    if (port >= 0)
        return port;
    return false;
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
    debug('Listening on ' + bind);
    console.log('Listening on ' + bind);

    io.on("connection", (s) => {
        initSocket(s)
    });
}


var sockets = [];
var broadcast = function (event, data) {
    sockets.forEach(function (socket) {
        socket.emit(event, data);
    });
};

var initSocket = function (socket) {
    sockets.push(socket);
    socket.on("disconnect", () => {
        sockets.splice(sockets.indexOf(socket), 1);
    });
    socket.on("ctrl", (a, b, c) => {
        mqtt.mqtt_seng_ctrl(a, b, c);
    });
    mqtt.addSock(socket);
}