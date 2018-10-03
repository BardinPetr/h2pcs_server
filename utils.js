const DEBUG = true;
var crypto = require('crypto');


var hash = function(e) {
    return crypto.createHash('md5').update(e).digest("hex");
}

var log = function(e) {
    if (DEBUG)
        console.log(e);
}

var RADIUS = 6371;

var toRad = function(n) {
    return n * Math.PI / 180;
};

var gpsDist = function(from, to) {
    var fromLat = from[0];
    var fromLon = from[1];
    var toLat = to[0];
    var toLon = to[1];

    var dLat = toRad(toLat - fromLat);
    var dLon = toRad(toLon - fromLon);
    var fromLat = toRad(fromLat);
    var toLat = toRad(toLat);

    var a = Math.pow(Math.sin(dLat / 2), 2) +
        (Math.pow(Math.sin(dLon / 2), 2) * Math.cos(fromLat) * Math.cos(toLat));
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return RADIUS * c;
};

module.exports.merge = function(obj1, obj2) {
    for (var attrname in obj2) {
        if(attrname != "merge")
            obj1[attrname] = obj2[attrname];
    }
    return obj1;
};

var min = (e) => { return Math.min.apply(Math, e) };

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function unique(items) {
    var lookup = {};
    var result = [];
    for (var item, i = 0; item = items[i++];) {
        var name = item.name;
        if (!(name in lookup)) {
            lookup[name] = 1;
            result.push(item);
        }
    }
    return result;
}

module.exports.hash = hash;
module.exports.log = log;
module.exports.gpsDist = gpsDist;
module.exports.min = min;
module.exports.getRandomInt = getRandomInt;
module.exports.unique = unique;
module.exports.DEBUG = DEBUG;