import Repository from './../helpers/repository';
import {initCRUDRoutes} from './../helpers/CRUD-routes';

var express = require('express');
var router = express.Router();
var async = require('async');
var Sandbox = require("sandbox"), s = new Sandbox();
var ChainModel = require('../models/chain');
var Node = require('../models/node');

initCRUDRoutes(ChainModel, router);

router.post('/:id/execute', function (req, res, next) {

  let store = {
    states: [],
    getStates(){
      return this.states;
    },
    getState() {
      return this.states[this.states.length - 1];
    },
    setState(state){
      this.states.push(state);
      return this;
    }
  };

  Repository.readModel(ChainModel, req.params.id, (err, Chain) => {
    if(!Chain){
      res.sendJsonError(404, 'Chain not found')
    } else {
      executeNode(new Node({type: "branch", nodes: Chain.nodes}), store.setState(req.body), function (err, result) {
        res.sendJson(result.getState())
      });
    }
  });

  function executeNode(node, store, callback) {
    switch (node.type) {

      case 'code':
        let func = node.trusted ? runNativeCode : runCodeInSandbox;

        func(node.code, store.getState(), function (err, data) {
          callback(err, store.setState(data));
        });

        break;

      case 'branch':
        async.waterfall(wrapNodeTasks(node.nodes, store), (err, result) => {
          callback(err, result)
        });
        break;
    }
  }

  function runNativeCode(code, data, callback) {
    eval(code);
    callback(null, data);
  }

  function wrapNodeTasks(tasks, store) {
    let wrapped = [async.apply(executeNode, tasks[0], store)];
    if (tasks.length > 1) {
      for (var i = 1; i < tasks.length; i++) {
        wrapped.push(async.apply(executeNode, tasks[i]))
      }
    }
    return wrapped;
  }

  function runCodeInSandbox(code, data, callback) {
    s.run(prepareCodeForSandbox(code, data), function (output) {
      callback(null, (output.console[0]));
    });
  }

  function prepareCodeForSandbox(code, data) {
    return 'var data = ' +
      JSON.stringify(store.getState()) + ';' +
      code.replace(/console\s*\.\s*(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\s*\((.*)\);?/g, '')
      + "\nconsole.log(data)"
  }
});

module.exports = router;