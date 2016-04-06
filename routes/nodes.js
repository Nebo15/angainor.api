var express = require('express');
var util = require('util');
var Node = require('../models/node');
var router = express.Router();
var async = require('async');
var Sandbox = require("sandbox"), s = new Sandbox();

router.get('/sandbox', function (req, res, next) {

  var code = 'var data = {test:1, next: "wow"}; data.test += 1; data.next = "so much wow"; console  .' + "\n" + '  log  (data);';

  code = code.replace(/console\s*\.\s*(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\s*\((.*)\);?/g, '');

  // s.run(code + "\nconsole.log(data)", function (output) {
  //   res.send("Sandbox response: " + util.inspect(output.console) + "\n")
  // })
});

router.get('/', function (req, res, next) {

  var data = {amount: 100};

  var nodeBranch1 = new Node({type: 'code', code: 'data.branch = "first"'});
  var nodeBranch2 = new Node({type: 'code', code: 'data.lunch = "second"'});
  var node1 = new Node({type: 'code', code: 'data.amount += 10'});
  var node2 = new Node({type: 'code', code: 'data.amount -= 5'});
  var node3 = new Node({type: 'branch', tasks: [nodeBranch1, nodeBranch2]});
  var node4 = new Node({type: 'code', code: 'data.final = "finish"'});

  async.waterfall([
    // async.apply(executeNode, node1, data),
    // async.apply(executeNode, node2),
    async.apply(executeNode, node3, data),
    // async.apply(executeNode, node4),
  ], function (err, result) {
    res.send('wow ' + util.inspect(result))
  });

  function executeNode(node, data, callback) {
    switch (node.type) {

      case 'code':
        var code = node.code.replace(/console\s*\.\s*(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\s*\((.*)\);?/g, '');

        s.run('var data = ' + JSON.stringify(data) + ';' + code + "\nconsole.log(data)", function (output) {
          callback(null, output.console[0]);
        });
        break;

      case 'branch':
        var tasks = [async.apply(executeNode, node.tasks[0], data)];
        if (node.tasks.length > 1) {
          for (var i = 1; i < node.tasks.length; i++) {
            tasks.push(async.apply(executeNode, node.tasks[i]))
          }
        }
        //res.send(util.inspect(data));
        async.waterfall(tasks, function (result) {
          res.send(util.inspect(result));
          callback(null, result);
        });
    }
  }
});

module.exports = router;