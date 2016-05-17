var request = require('supertest');

export default class Helper {

  constructor() {
    this.baseUrl = 'http://localhost:3333';
    this.nodeData = {
      title: 'Test title node',
      description: 'Test desc node',
      type: 'code',
      trusted: true,
      code: '<?php die("hacked"); ?>'
    };

    {
      var node1 = {type: "code", trusted: true, code: "data.amount += 10"};
      var node2 = {type: "code", trusted: true, code: "data.amount -= 5"};
      var node3 = {
        type: "branch",
        nodes: [
          {type: "code", trusted: true, code: "data.property = true"},
          {type: "code", trusted: true, code: "data.employment = false"},
          {type: "code", trusted: true, code: "data.internal_credit_history = 'nice'"},
          {
            type: "http",
            httpOptions: {
              hostname: "gandalf.dev",
              path: "/api/v1/tables/573b04c3a60ad659090041b7/decisions",
              auth: "admin:admin"
            }
          }
        ]
      };
      var node4 = {
        type: "branch", nodes: [
          {type: "code", trusted: true, code: "data.branch = 'first'"},
          {type: "code", trusted: true, code: "data.lunch = 'second'"}
        ]
      };
      var node5 = {type: "code", trusted: true, code: "data.final = 'finish'"};

      this.chainData = {
        title: "Simple chain",
        description: "Simple description chain",
        nodes: [
          node1,
          node2,
          node3,
          node4,
          node5
        ]
      }
    }
  }

  /*
   * node functions
   */

  createNode(data, callback) {
    if (typeof data === 'function') {
      callback = data;
      data = this.nodeData;
    }
    request(this.baseUrl)
      .post('/nodes')
      .send(data)
      .end((err, res) => {
        if (err) {
          throw err;
        }
        this.assertNode(res, 201, data);
        callback(res)
      });
  }

  assertNodesList(res) {
    this.assertResponseFields(res);
    res.body.data.should.be.instanceof(Array);
    for (var i = 0; i < res.body.data.length; i++) {
      res.body.data[i].should.have.properties('_id', 'title', 'description', 'code', 'type');
    }
  }

  assertNode(res, code, values) {
    this.assertResponseFields(res, code);
    res.body.data.should.have.properties('_id', 'title', 'description', 'code', 'type');
    if (values !== 'undefined') {
      res.body.data.should.have.properties(values)
    }
  }

  /*
   * chain functions
   */

  createChain(data, callback) {
    if (typeof data === 'function') {
      callback = data;
      data = this.chainData;
    }
    request(this.baseUrl)
      .post('/chains')
      .send(data)
      .end((err, res) => {
        if (err) {
          throw err;
        }
        this.assertChain(res, 201, data);
        callback(res)
      });
  }

  assertChain(res, code, values) {
    this.assertResponseFields(res, code);
    res.body.data.should.have.properties('_id', 'title', 'description', 'nodes');
    if (values !== 'undefined') {
      // res.body.data.should.have.properties(values)
    }
  }

  assertChainsList(res) {

  }

  /*
   * general functions
   */

  assertResponseFields(res, code) {
    res.statusCode.should.equal(code || 200);
    this.assertResponseJson(res)
      .body.should.have.properties('meta', 'data');
    res.body.meta.should.have.property('code', code || 200);

    return res;
  }

  assertResponseErrorFields(res, code) {
    res.statusCode.should.equal(code);
    this.assertResponseJson(res)
      .body.should.have.properties('meta');
    res.body.meta.should.have.property('code', code);
    res.body.meta.should.have.property('error');

    return res;
  }

  assertResponseJson(res) {
    res.header.should.have.property('content-type', 'application/json; charset=utf-8');

    return res;
  }
}
