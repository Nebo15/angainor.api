var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var storeSchema = new Schema({
  chainId: Schema.Types.ObjectId,
  states: [{
    node: {
      _id: Schema.Types.ObjectId,
      title: String,
      type: {type: String},
      code: Schema.Types.Mixed
    },
    input: Schema.Types.Mixed,
    output: Schema.Types.Mixed,
    err: Schema.Types.Mixed
  }]
});

storeSchema.method('setState', function (Node, input, output, code, cb) {

  if (typeof code === 'function') {
    cb = code;
    code = null;
  }
  if (typeof output === 'function') {
    cb = output;
    code = null;
    output = null;
  }
  this.states.push(this.prepareState(Node, input, output, code));
  this.save(err => err ? this.setErrorState(err, cb(err, this)) : cb(err, this));
});

storeSchema.method('getState', function () {
  return this.states[this.states.length - 1];
});

storeSchema.method('prepareState', (Node, input, output, code) => {
  return {
    node: {
      _id: Node._id,
      title: Node.title,
      type: Node.type,
      code
    },
    input,
    output
  }
});

storeSchema.method('setErrorState', function (err, cb) {
  this.states.push({err});
  this.save(() => cb(err, this));
});

module.exports = mongoose.model('Store', storeSchema);
