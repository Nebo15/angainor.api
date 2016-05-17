var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Node = new Schema();
Node.add({
  title: {type: String, min: 2, max: 128},
  description: {type: String, min: 2, max: 512},
  type: {type: String, enum: ['code', 'http', 'branch']},
  trusted: {type: Boolean, default: false},
  code: {type: String, min: 2, max: 1024},
  httpOptions: {
    hostname: {type: String, min: 2, max: 1024},
    path: {type: String, min: 1, max: 1024},
    port: {type: Number, max: 65536, default: 80},
    method: {type: String, enum: ['POST', 'GET'], default: 'POST'},
    auth: {},
    headers: {}
  },
  nodes: [Node]
});

module.exports = mongoose.model('Node', Node);
