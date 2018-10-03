var mongoose = require('mongoose')

var PlantSchema = new mongoose.Schema({
  uid: {
    type: Number,
    default: -13
  },
  user: String,
  voice: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: 'Растение'
  },
})

PlantSchema.methods.update_uid = function (cb) {
  this.model('Plant').countDocuments({}, (err, cur_uid) => {
    if (err) {
      console.log(err)
      cb(err, null)
    } else {
      console.log(this)
      this.model('Plant').updateOne({
        uid: -13
      }, {
        uid: cur_uid
      }, (err, d) => {
        console.log(err, d)
        cb(err, d)
      })
    }
  });
};

module.exports = mongoose.model('Plant', PlantSchema)
