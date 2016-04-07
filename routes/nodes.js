'use strict';

var express = require('express');
var util = require('util');
var Node = require('../models/node');
var router = express.Router();
var async = require('async');
var Sandbox = require("sandbox"), s = new Sandbox();

router.get('/test', function (req, res, next) {
  res.send('asd')
});

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

  var nodeBranch1 = new Node({type: 'code', code: 'data.branch = "first"'});
  var nodeBranch2 = new Node({type: 'code', code: 'data.lunch = "second"'});
  var node1 = new Node({type: 'code', code: 'data.amount += 10'});
  var node2 = new Node({type: 'code', code: 'data.amount -= 5'});
  var node3 = new Node({type: 'branch', tasks: [nodeBranch1, nodeBranch2]});
  var node4 = new Node({type: 'code', code: 'data.final = "finish"'});

  var nodeParallel = new Node({
    type: 'branch',
    tasks: [
      new Node({type: 'code', code: 'data.parallel = "wow"'}),
      new Node({type: 'code', code: 'data.parallel = "how"'}),
      new Node({type: 'code', code: 'data.parallel = "now"'}),
      new Node({type: 'code', code: 'data.parallel = "bow"'}),
    ]
  });

  var chain = new Node({
    type: 'branch', tasks: [
      node1,
      node2,
      nodeParallel,
      // nodeParallel,
      // nodeParallel,
      // node3,
      // node4
    ]
  });

  executeNode(chain, store.setState({amount: 100}), function (err, result) {
    res.send('wow ' + util.inspect(result.getState()) + '\n')
  });

  function executeNode(node, store, callback) {
    switch (node.type) {

      case 'code':
        var code = node.code.replace(/console\s*\.\s*(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\s*\((.*)\);?/g, '');

        s.run('var data = ' + JSON.stringify(store.getState()) + ';' + code + "\nconsole.log(data)", function (output) {
          callback(null, store.setState(output.console[0]));
        });
        break;

      case 'branch':
        async.waterfall(wrapNodeTasks(node.tasks, store), (err, result) => {
          callback(err, result)
        });
        break;
    }
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
});

module.exports = router;