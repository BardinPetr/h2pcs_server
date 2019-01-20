var mosca = require('mosca'),
  mongoose = require('mongoose');

var PlantModel = require('./Plant_schema');

mongoose.connect('mongodb://a:a123456@ds119993.mlab.com:19993/h2pcs', {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {});

module.exports = () => {
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
