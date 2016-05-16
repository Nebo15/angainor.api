var mongoose = require('mongoose');
require('mongoose-type-url');
var Schema = mongoose.Schema;

var Node = new Schema();
Node.add({
  title: {type: String, min: 2, max: 128},
  description: {type: String, min: 2, max: 512},
  type: {type: String, enum: ['code', 'http', 'branch']},
  trusted: {type: Boolean, default: false},
  code: {type: String, min: 2, max: 1024},
  http_data: {
    url: {type: mongoose.SchemaTypes.Url, max: 1024},
    method: {type: String, enum: ['POST', 'GET']},
    authType: {type: String, enum: ['BASIC', 'OAuth']},
    // credentials: {},
    headers: []
  },
  nodes: [Node]
});

module.exports = mongoose.model('Node', Node);
