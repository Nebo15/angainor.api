'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var nodeCodeSchema = new Schema({
  code: {type: String, min: 2, max: 1024}
});

module.exports = mongoose.model('NodeCode', nodeCodeSchema);

