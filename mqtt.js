const
    topic_status = "carcontrol/status",
    topic_drive = "carcontrol/drive",
    topic_func = "carcontrol/func",
    topic_data = "carcontrol/data",
    topic_cb = "carcontrol/cb";

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
    port: 1883,
    backend: set
};

var server = new mosca.Server(settings);

server.on('clientConnected', function(client) {
    console.log('new client', client.id);
});
server.on('ready', mqtt_started);

function mqtt_started() {
    console.log('Mosca server is up and running');
    client = mqtt.connect('mqtt://localhost');

    client.on('connect', function() {
        client.subscribe(topic_status)
        client.subscribe(topic_data)
        client.subscribe(topic_cb)
        client.subscribe(topic_drive)
        client.subscribe(topic_func)
        client.publish(topic_status, '@server/started');
    });

    client.on('message', function(topic, message) {
        message = message.toString();
        if (message == "@ping") {
            var n = Date.now();
            console.log(n + "  " + lastPing);
            df = n - lastPing - 3000;
            lastPing = Date.now();
            console.log("Ping time: " + df);
        }
        console.log(message);
    });
    //client.end();
}


function mqtt_get_ping() {
    return df;
}

function mqtt_send_drive(a, b) {
    var res = "@drive:" + a + "&" + b + ";";
    client.publish(topic_drive, res);
}

function mqtt_send_func(a) {
    client.publish(topic_func, a);
}

module.exports.mqtt_send_drive = mqtt_send_drive;
module.exports.mqtt_send_func = mqtt_send_func;