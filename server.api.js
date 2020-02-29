var mosca = require("mosca"),
  mongoose = require("mongoose"),
  fs = require("fs");

var PlantModel = require("./Plant_schema");

mongoose.connect(
  process.env.MDB_CONN,
  {
    useNewUrlParser: true
  }
);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {});

module.exports = image_received => {
  var bodyParser = require("body-parser");
  var express = require("express");

  var app = express();
  app.use(
    bodyParser.json({
      limit: "10mb"
    })
  );
  app.use(
    bodyParser.urlencoded({
      extended: true,
      limit: "10mb"
    })
  );
  app.get("/get_guid", (req, res) => {
    var user_uid = req.query.uid;
    PlantModel.find(
      {
        user: parseInt(user_uid)
      },
      (err, data) => {
        if (err) {
          res.sendStatus(500);
        } else {
          if (data.length === 0) {
            res.sendStatus(404);
          } else {
            res.json(data[0]);
          }
        }
      }
    );
  });
  app.get("/create_guid", (req, res) => {
    PlantModel.countDocuments({}, (err, cur_uid) => {
      var n = new PlantModel({
        user: "-unregistred-uid",
        uid: cur_uid
      });
      n.save((err, data) => {
        if (err) {
          res.sendStatus(500);
        } else {
          res.json(data.uid);
        }
      });
    });
  });

  app.get("/register_guid", (req, res) => {
    var uuid = req.query.uuid,
      guid = req.query.guid;
    PlantModel.updateOne(
      {
        uid: guid
      },
      {
        user: uuid
      },
      (err, res) => {
        if (err) res.sendStatus(500);
        else res.sendStatus(200);
      }
    );
  });

  app.post("/image", (req, res) => {
    try {
      fs.writeFileSync(
        `${process.cwd()}/public/realtime/${req.body.guid}.dat`,
        req.body.pic
      );
    } catch (ex) {
      console.error(ex);
    }
    image_received(req.body.guid, req.body.pic);
    res.sendStatus(200);
  });

  app.listen(3971, () => {
    console.log("Base SGH API is running on 3971");
  });
};
