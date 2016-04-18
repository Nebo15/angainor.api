var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Node = require('../models/node');

var Chain = new Schema({
  title: {type: String, min: 2, max: 128},
  description: {type: String, min: 2, max: 512},
  links: [Node]
});

module.exports = mongoose.model('Chain', Chain);
