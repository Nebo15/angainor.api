'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var nodeSchema = new Schema({
  type: {type: String, enum: ['code', 'http', 'branch', 'parallel']},
  code: {type: String, min: 2, max: 1024},
  tasks: {type: Array}
});

module.exports = mongoose.model('Node', nodeSchema);

