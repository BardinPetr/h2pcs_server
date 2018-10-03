var mosca = require('mosca'),
  mongoose = require('mongoose');

var PlantModel = require('./Plant_schema');

mongoose.connect('mongodb://localhost/h2pcs');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {});

var settings = {
  port: 1883,
  backend: {
    type: 'mongo',
    url: 'mongodb://127.0.0.1:27017/mqtt',
    pubsubCollection: 'h2pcs-mqtt',
    mongo: {}
  }
};

module.exports = () => {
  /*
  var server = new mosca.Server(settings);

  server.on('clientConnected', function (client) {
    console.log('client connected', client.id);
  });

  server.on('ready', () => {
    console.log('Mosca server is up and running');
  });
  */

  var express = require('express');
  var app = express();
  app.get('/get_guid', (req, res) => {
    var user_uid = req.query.uid
    PlantModel.find({
      user: parseInt(user_uid)
    }, (err, data) => {
      if (err) {
        res.sendStatus(500)
      } else {
        if (data.length === 0) {
          res.sendStatus(404)
        } else {
          res.json(data[0])
        }
      }
    })
  });
  app.get('/create_guid', (req, res) => {
    PlantModel.countDocuments({}, (err, cur_uid) => {
      var n = new PlantModel({
        user: "-unregistred-uid",
        uid: cur_uid
      });
      n.save((err, data) => {
        if (err) {
          res.sendStatus(500)
        } else {
          res.json(data.uid)
        }
      })
    })
  });

  app.get('/register_guid', (req, res) => {
    var uuid = req.query.uuid,
      guid = req.query.guid
    PlantModel.updateOne({
      uid: guid
    }, {
      user: uuid
    }, (err, res) => {
      if (err) res.sendStatus(500)
      else res.sendStatus(200)
    })
  });

  app.listen(3971, () => {
    console.log('Base SGH API is running on 3971');
  });
}
module.exports()