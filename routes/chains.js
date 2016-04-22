import Repository from './../helpers/repository';
import {initCRUDRoutes} from './../helpers/CRUD-routes';

var express = require('express');
var router = express.Router();
var async = require('async');
var Sandbox = require("sandbox"), s = new Sandbox();
var ChainModel = require('../models/chain');
var NodeModel = require('../models/node');
var StoreModel = require('../models/store');

initCRUDRoutes(ChainModel, router);

router.post('/:id/execute', function (req, res, next) {

  Repository.readModel(ChainModel, req.params.id, (err, Chain) => {
    if (!Chain) {
      res.sendJsonError(404, 'Chain not found')
    } else {
      let Node = new NodeModel({type: "branch", title: "Init branch", nodes: Chain.nodes});
      let Store = new StoreModel({chainId: Chain._id});
      Store.states = [Store.prepareState(Node, req.body)];

      async.waterfall(
        wrapNodes(Node.nodes, Store), (err, result) => res.sendJson(result.getState().input)
      );
    }
  });

  function executeNode(Node, Store, callback) {
    switch (Node.type) {
      case 'code':
        let func = Node.trusted ? runNativeCode : runCodeInSandbox;


        func(Node.code, Store.getState().input, (err, output, code) => {
          Store.setState(Node, Store.getState().input, output, code, (err, state) => {
            err ? handleError(err) : callback(err, state);
          });
        });
        break;

      case 'branch':
        Store.setState(Node, Store.getState().input, (err) => {
            err ? handleError(err) : async.waterfall(
              wrapNodes(Node.nodes, Store), (err, result) => callback(err, result)
            );
          }
        );
        break;
    }
  }

  function handleError(err) {
    res.sendJsonError(422, err.message, err);
  }

  function runNativeCode(code, data, callback) {
    eval(code);
    callback(null, data, code);
  }

  function runCodeInSandbox(code, data, callback) {
    code = prepareCodeForSandbox(code, data);
    s.run(code, output => callback(null, (output.console[0]), code));
  }

  function prepareCodeForSandbox(code, data) {
    return 'var data = ' +
      JSON.stringify(data) + ';' +
      code.replace(/console\s*\.\s*(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\s*\((.*)\);?/g, '')
      + "\nconsole.log(data)"
  }

  function wrapNodes(tasks, Store) {
    let wrapped = [async.apply(executeNode, tasks[0], Store)];
    if (tasks.length > 1) {
      for (var i = 1; i < tasks.length; i++) {
        wrapped.push(async.apply(executeNode, tasks[i]))
      }
    }
    return wrapped;
  }
});

module.exports = router;