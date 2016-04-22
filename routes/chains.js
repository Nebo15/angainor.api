import Repository from './../helpers/repository';
import {initCRUDRoutes} from './../helpers/CRUD-routes';

var express = require('express');
var router = express.Router();
var async = require('async');
var Sandbox = require("sandbox"), s = new Sandbox();
var ChainModel = require('../models/chain');
var Node = require('../models/node');
var StoreModel = require('../models/store');

initCRUDRoutes(ChainModel, router);

router.post('/:id/execute', function (req, res, next) {

  Repository.readModel(ChainModel, req.params.id, (err, Chain) => {
    if (!Chain) {
      res.sendJsonError(404, 'Chain not found')
    } else {
      let Store = new StoreModel({chainId: Chain._id, states: []});
      let node = new Node({type: "branch", nodes: Chain.nodes});

      Store.setState(node, req.body, (err, state) => {
          err ?
            res.sendJsonError(422, err.message, err) :
            executeNode(node, state, (err, result) => res.sendJson(result.getState().input))
        }
      );
    }
  });

  function executeNode(node, Store, callback) {
    switch (node.type) {
      case 'code':
        let func = node.trusted ? runNativeCode : runCodeInSandbox;

        func(node.code, Store.getState().input, (err, data, code) => {
          Store.setState(node, data, code, (err, state) => {
            err ? res.sendJsonError(422, err.message, err) : callback(err, state);
          });
        });
        break;

      case 'branch':
        async.waterfall(wrapNodeTasks(node.nodes, Store), (err, result) => callback(err, result));
        break;
    }
  }

  function runNativeCode(code, data, callback) {
    eval(code);
    callback(null, data, code);
  }

  function runCodeInSandbox(code, data, callback) {
    code = prepareCodeForSandbox(code, data);
    s.run(code, output => callback(null, (output.console[0]), code));
  }

  function wrapNodeTasks(tasks, Store) {
    let wrapped = [async.apply(executeNode, tasks[0], Store)];
    if (tasks.length > 1) {
      for (var i = 1; i < tasks.length; i++) {
        wrapped.push(async.apply(executeNode, tasks[i]))
      }
    }
    return wrapped;
  }

  function prepareCodeForSandbox(code, data) {
    return 'var data = ' +
      JSON.stringify(Store.getState().input) + ';' +
      code.replace(/console\s*\.\s*(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\s*\((.*)\);?/g, '')
      + "\nconsole.log(data)"
  }
});

module.exports = router;