'use strict';

import {initCRUDRoutes} from './../helpers/CRUD-routes';

var express = require('express');
var router = express.Router();
var Node = require('../models/node');
var async = require('async');
var Sandbox = require("sandbox"), s = new Sandbox();

initCRUDRoutes(Node, router);

router.get('/async', function (req, res, next) {

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

  var nodeBranch1 = new Node({type: 'code', trusted: true, code: 'data.branch = "first"'});
  var nodeBranch2 = new Node({type: 'code', trusted: true, code: 'data.lunch = "second"'});
  var node1 = new Node({type: 'code', trusted: true, code: 'data.amount += 10'});
  var node2 = new Node({type: 'code', trusted: true, code: 'data.amount -= 5'});
  var node3 = new Node({type: 'branch', tasks: [nodeBranch1, nodeBranch2]});
  var node4 = new Node({type: 'code', trusted: true, code: 'data.final = "finish"'});

  var nodeParallel = new Node({
    type: 'branch',
    tasks: [
      new Node({type: 'code', trusted: true, code: 'data.parallel = "wow"'}),
      new Node({type: 'code', trusted: true, code: 'data.parallel = "how"'}),
      new Node({type: 'code', trusted: true, code: 'data.parallel = "now"'}),
      new Node({type: 'code', trusted: true, code: 'data.parallel = "bow"'})
    ]
  });

  var chain = new Node({
    type: 'branch', tasks: [
      node1,
      node2,
      nodeParallel,
      nodeParallel,
      nodeParallel,
      node3,
      node4
    ]
  });

  executeNode(chain, store.setState({amount: 100}), function (err, result) {
    res.sendJson(result.getState())
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
        async.waterfall(wrapNodeTasks(node.tasks, store), (err, result) => {
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