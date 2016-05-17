var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// var Node = require('../models/node');

var Node = new Schema();
Node.add({
  title: {type: String, min: 2, max: 128},
  description: {type: String, min: 2, max: 512},
  type: {type: String, enum: ['code', 'http', 'branch'], required: true},
  trusted: {type: Boolean, default: false},
  code: {type: String, min: 2, max: 1024},
  httpOptions: {
    hostname: {type: String, min: 2, max: 1024},
    path: {type: String, min: 1, max: 1024},
    port: {type: Number, max: 65536},
    method: {type: String, enum: ['POST', 'GET']},
    auth: {},
    headers: {}
  },
  nodes: [Node]
});

var Chain = new Schema({
  title: {type: String, min: 2, max: 128},
  description: {type: String, min: 2, max: 512},
  nodes: [Node]
});

module.exports = mongoose.model('Chain', Chain);
