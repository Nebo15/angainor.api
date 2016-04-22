var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var storeSchema = new Schema({
  chainId: Schema.Types.ObjectId,
  states: [{
    node: {
      _id: Schema.Types.ObjectId,
      type: {type: String},
      code: Schema.Types.Mixed
    },
    input: Schema.Types.Mixed
  }]
});

storeSchema.method('setState', function (node, input, code, cb) {

  if (typeof code === 'function') {
    cb = code;
    code = null;
  }
  this.states.push({
    node: {
      _id: node._id,
      type: node.type,
      code
    }, input
  });
  this.save(err => cb(err, this))
});

storeSchema.method('getState', function () {
  return this.states[this.states.length - 1];
});

module.exports = mongoose.model('Store', storeSchema);
