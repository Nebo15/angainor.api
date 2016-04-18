var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Node = new Schema();
Node.add({
  title: {type: String, min: 2, max: 128},
  description: {type: String, min: 2, max: 512},
  type: {type: String, enum: ['code', 'http', 'branch', 'parallel']},
  trusted: {type: Boolean, default: false},
  code: {type: String, min: 2, max: 1024},
  tasks: [Node]
});

module.exports = mongoose.model('Node', Node);
