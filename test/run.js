// Here you can set before and after running scripts 
// http://stackoverflow.com/questions/24153261/joining-tests-from-multiple-files-with-mocha-js?answertab=votes#tab-top

var mongoose = require('mongoose');

describe("Execute tests", (done) => {
  beforeEach(() => {
    mongoose.connect('mongodb://localhost/angoinor_test', () => {
      mongoose.connection.db.dropDatabase()
    })
  });
  require('./nodes/nodes.js');
  require('./chains/chains.js');
});