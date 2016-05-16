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
          wrapNodes(Node.nodes, Store), (err, result) => res.sendJson(result.getState().output)
        )
      });
    }
  });

  function executeNode(Node, Store, callback) {
    switch (Node.type) {
      case 'code':
        let func = Node.trusted ? runNativeCode : runCodeInSandbox;

        func(Node.code, Store.getState().output, (err, output, code) => {
          Store.setState(Node, output, code, (err, state) => {
            err ? handleError(err) : callback(err, state);
          });
        });
        break;
      
      case 'http':


        var options = {
          hostname: 'gandalf-api.nebo15.com',
          port: 80,
          path: '/',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        };

        var req = http.request(options, (res) => {
          console.log(`STATUS: ${res.statusCode}`);
          console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);

            Store.setState(Node, chunk, (err, state) => {
              err ? handleError(err) : callback(err, state);
            });
          });
          res.on('end', () => {
            console.log('No more data in response.');

          })
        });

        req.on('error', (err) => {
          console.log(`problem with request: ${e.message}`);
          handleError(err)
        });

        req.write(JSON.stringify(Store.getState().output));
        req.end();
        
        break;

      case 'branch':
        Store.setState(Node, Store.getState().output, (err) => {
            err ? handleError(err) : async.waterfall(
              wrapNodes(Node.nodes, Store), (err, result) => callback(err, result)
            );
          }
        );
        break;
    }
  }

  let initChain = (Chain, cb) => {
    let Node = new NodeModel({type: "branch", title: "Init branch", nodes: Chain.nodes});
    let Store = new StoreModel({chainId: Chain._id});
    Store.setState(Node, req.body, (err, Store) => {
      err ? handleError(err) : cb(Node, Store);
    });
  };

  let handleError = err => {
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