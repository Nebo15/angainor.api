'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stateSchema = new Schema({

});

module.exports = mongoose.model('State', stateSchema);
