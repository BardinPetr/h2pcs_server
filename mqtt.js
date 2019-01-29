const topic_status = "sgh/status",
  topic_drive = "sgh/drive",
  topic_func = "sgh/func",
  topic_data = "sgh/data",
  topic_ctrl = "sgh/ctrl",
  topic_cb = "sgh/cb";

var _ = require("underscore"),
  mosca = require("mosca"),
  mqtt = require("mqtt");

var server = new mosca.Server({
  port: 1883,
  backend: {
    type: "mongo",
    url: "mongodb://a:a123456@ds119993.mlab.com:19993/h2pcs",
    pubsubCollection: "ascoltatori",
    mongo: {}
  }
});

var client = null,
  sockets = {},
  sid2guid = {};

module.start_cb = undefined;

server.on("clientConnected", function (client) {
  console.log("new client", client.id);
});

server.on("ready", () => setTimeout(mqtt_started, 100));

function mqtt_started() {
  console.log("Mosca server is up and running");
  client = mqtt.connect("mqtt://localhost:1883");

  client.on("connect", function () {
    console.log("CONNECTED");
    client.publish(topic_status, "@server/started");
    module.start_cb()
  });

  client.on("message", function (topic, message) {
    message = message.toString();
    var guid = parseInt(topic.toString().split('/')[2]);
    try {
      gbroadcast_emit(guid, "data", message);
    } catch (ignore) {}
  });
}

function send(a, b) {
  client.publish(a, b);
}

function gbroadcast_emit(guid, ...a) {
  try {
    Object.values(sockets[guid]).forEach(s => s.emit(...a))
  } catch (ignore) {}
}

var addSock = function (sock, guid) {
  if (!sockets[guid]) sockets[guid] = {}
  sockets[guid][sock.id] = sock;
  sid2guid[sock.id] = guid;
  client.subscribe(`/sgh/${guid}/data`);
  client.subscribe(`/sgh/${guid}/cam`);
};

var delSock = function (socket) {
  try {
    var guid = sid2guid[socket.id];
    delete sockets[guid][socket.id];
    delete sid2guid[socket.id];
    if (Object.values(sockets[guid]).length == 0) {
      client.unsubscribe(`/sgh/${guid}/data`);
      client.unsubscribe(`/sgh/${guid}/cam`);
    }
  } catch (ignore) {}
};

var sendPic = function (guid, data) {
  gbroadcast_emit(guid, "video", data);
};

module.exports.setOnInitFinished = (f) => {
  module.start_cb = f;
};

module.exports.send = send;
module.exports.addSock = addSock;
module.exports.delSock = delSock;
module.exports.sendPic = sendPic;