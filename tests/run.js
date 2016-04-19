// Here you can set before and after running scripts 
// http://stackoverflow.com/questions/24153261/joining-tests-from-multiple-files-with-mocha-js?answertab=votes#tab-top

var mongoose = require('mongoose');

import app from './../app';
import http from 'http';

describe("Execute tests", (done) => {

  var httpServer = http.createServer(app);
  before((done) => {
    httpServer.listen(3333, (err, res) => {
      done(err);
    });
  });

  beforeEach(() => {
    mongoose.connect('mongodb://localhost/angoinor_test', () => {
      mongoose.connection.db.dropDatabase()
    })
  });

  require('./nodes/nodes.js');
  require('./chains/chains.js');

  after((done) => {
    httpServer.close();
    done();
  });
});