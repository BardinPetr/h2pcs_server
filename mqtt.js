const
    topic_status = "sgh/status",
    topic_drive = "sgh/drive",
    topic_func = "sgh/func",
    topic_data = "sgh/data",
    topic_ctrl = "sgh/ctrl",
    topic_cb = "sgh/cb";

var mosca = require('mosca'),
    mqtt = require('mqtt');
var client = null;

var lastPing = 0;
var df = 0;

var set = {
    type: 'mongo',
    url: 'mongodb://localhost:27017/mqtt',
    pubsubCollection: 'ascoltatori',
    mongo: {}
};

var settings = {
    port: 1889,
    backend: set
};

var server = new mosca.Server(settings);

var sockets = [];

server.on('clientConnected', function(client) {
    console.log('new client', client.id);
});
server.on('ready', mqtt_started);

function mqtt_started() {
    console.log('Mosca server is up and running');
    client = mqtt.connect('mqtt://localhost:1889');

    client.on('connect', function() {
        console.log("CONNECTED")
        client.subscribe(topic_status)
        client.subscribe(topic_data)
        client.subscribe(topic_cb)
        client.subscribe(topic_drive)
            //client.subscribe(topic_ctrl)
        client.subscribe(topic_func)
        client.publish(topic_status, '@server/started');
    });

    client.on('message', function(topic, message) {
        message = message.toString();
        console.log(message)
        sockets.forEach(function(sock) {
            sock.emit("mqtt", topic, message);
        }, this);
    });
    //client.end();
}

function mqtt_seng_ctrl(a, b, c) {
    var res = a + ";" + b + ";" + c + ";";
    client.publish(topic_ctrl, res);
}

var addSock = function(sock) {
    sockets.push(sock);
}

module.exports.mqtt_seng_ctrl = mqtt_seng_ctrl;
module.exports.addSock = addSock;