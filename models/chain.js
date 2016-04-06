'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chainSchema = new Schema({
  title: {type: String, min: 2, max: 128},
  description: {type: String, min: 2, max: 512},
  links: [{}]
});

module.exports = mongoose.model('Chain', chainSchema);
