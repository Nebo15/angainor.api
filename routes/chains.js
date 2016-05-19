import Repository from './../helpers/repository';
import {initCRUDRoutes} from './../helpers/CRUD-routes';

var express = require('express');
var router = express.Router();
var async = require('async');
var Sandbox = require("sandbox"), s = new Sandbox();
var ChainModel = require('../models/chain');
var NodeModel = require('../models/node');
var StoreModel = require('../models/store');
var clone = require('clone');
var http = require('http');

initCRUDRoutes(ChainModel, router);

router.post('/:id/execute', function (req, res, next) {

  Repository.readModel(ChainModel, req.params.id, (err, Chain) => {
    if (!Chain) {
      res.sendJsonError(404, 'Chain not found')
    } else {
      initChain(Chain, (Node, Store) => {
        async.waterfall(
          wrapNodes(Node.nodes, Store), (err, Store) => {
            Store.status = 'completed';
            Store.save();
            res.sendJson(Store.getState().output)
          }
        )
      });
    }
  });

  let executeNode = (Node, Store, callback) => {
    let input = Store.getState().output;
    switch (Node.type) {

      case 'code':
        let func = Node.trusted ? runNativeCode : runCodeInSandbox;

        func(Node.code, input, (err, output, code) => {
          Store.setState(Node, output, code, (err, state) => {
            err ? handleError(err) : callback(err, state);
          });
        });
        break;

      case 'http':
        let req = http.request(Node.httpOptions, (res) => {
          let body = [];
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            body.push(chunk);
          });
          res.on('end', () => {
            input.httpResponses ? input.httpResponses.push(body.join()) : input.httpResponses = [body.join()];
            Store.setState(Node, input, (err, state) => {
              err ? handleError(err, Store) : callback(err, state);
            });
          })
        });

        req.on('error', (err) => {
          input.httpResponses ? input.httpErrors.push(err) : input.httpErrors = [err];
          Store.status = 'failed';
          Store.setState(Node, input, () => {
            handleError(err);
          });
        });

        req.write(JSON.stringify(input));
        req.end();

        break;

      case 'branch':
        Store.setState(Node, input, (err) => {
            err ? handleError(err, Store) : async.waterfall(
              wrapNodes(Node.nodes, Store), (err, result) => callback(err, result)
            );
          }
        );
        break;
    }
  };

  let initChain = (Chain, cb) => {
    let Node = new NodeModel({type: "branch", title: "Init branch", nodes: Chain.nodes});
    let Store = new StoreModel({chainId: Chain._id});
    Store.status = 'processing';
    Store.setState(Node, req.body, (err, Store) => {
      err ? handleError(err, Store) : cb(Node, Store);
    });
  };

  let handleError = (err, Store) => {
    if(typeof Store != 'undefined'){
      Store.status = 'failed';
      Store.save();
    }
    res.sendJsonError(422, err.message, err);
  };

  let runNativeCode = (code, data, callback) => {
    eval(code);
    callback(null, data, code);
  };

  let runCodeInSandbox = (code, data, callback) => {
    code = prepareCodeForSandbox(code, data);
    s.run(code, output => callback(null, (output.console[0]), code));
  };

  let prepareCodeForSandbox = (code, data) => {
    return 'var data = ' +
      JSON.stringify(data) + ';' +
      code.replace(/console\s*\.\s*(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\s*\((.*)\);?/g, '')
      + "\nconsole.log(data)"
  };

  let wrapNodes = (tasks, Store) => {
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