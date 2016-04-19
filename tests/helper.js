var request = require('supertest');

export default {
  baseUrl: 'http://localhost:3333',
  getNodeData: () => {
    return {
      title: 'Test title node',
      description: 'Test desc node',
      type: 'code',
      trusted: true,
      code: '<?php die("hacked"); ?>'
    }
  },
  getChainData: () => {
    var node1 = {type: "code", trusted: true, code: "data.amount += 10"};
    var node2 = {type: "code", trusted: true, code: "data.amount -= 5"};
    var node3 = {
      type: "branch", nodes: [
        {type: "code", trusted: true, code: "data.branch = 'first'"},
        {type: "code", trusted: true, code: "data.lunch = 'second'"}
      ]
    };
    var node4 = {type: "code", trusted: true, code: "data.final = 'finish'"};
    var node5 = {
      type: "branch",
      nodes: [
        {type: "code", trusted: true, code: "data.parallel = 'wow'"},
        {type: "code", trusted: true, code: "data.parallel = 'how'"},
        {type: "code", trusted: true, code: "data.parallel = 'now'"},
        {type: "code", trusted: true, code: "data.parallel = 'bow'"}
      ]
    };

    return {
      title: "Simple chain",
      description: "Simple description chain",
      nodes: [
        node1,
        node2,
        node5,
        node3,
        node4
      ]
    }
  },
  createNode: (data, callback) => {
    if (typeof data === 'function') {
      callback = data;
      data = this.helper.getNodeData();
    }
    request(this.helper.baseUrl)
      .post('/nodes')
      .send(data)
      .end((err, res) => {
        if (err) {
          throw err;
        }
        this.helper.assertNode(res, 201, data);
        callback(res)
      });
  },
  createChain: (data, callback) => {
    if (typeof data === 'function') {
      callback = data;
      data = this.helper.getChainData();
    }
    request(this.helper.baseUrl)
      .post('/chains')
      .send(data)
      .end((err, res) => {
        if (err) {
          throw err;
        }
        this.helper.assertChain(res, 201, data);
        callback(res)
      });
  },
  assertResponseJson: (res) => {
    res.header.should.have.property('content-type', 'application/json; charset=utf-8');
    return res;
  },
  assertResponseFields: (res, code) => {
    res.statusCode.should.equal(code || 200);
    this.helper.assertResponseJson(res)
      .body.should.have.properties('meta', 'data');
    res.body.meta.should.have.property('code', code || 200);
  },
  assertResponseErrorFields: (res, code) => {
    res.statusCode.should.equal(code);
    this.helper.assertResponseJson(res)
      .body.should.have.properties('meta');
    res.body.meta.should.have.property('code', code);
    res.body.meta.should.have.property('error');
  },
  assertNodesList: res => {
    this.helper.assertResponseFields(res);
    res.body.data.should.be.instanceof(Array);
    for (var i = 0; i < res.body.data.length; i++) {
      res.body.data[i].should.have.properties('_id', 'title', 'description', 'code', 'type');
    }
  },
  assertNode: (res, code, values) => {
    this.helper.assertResponseFields(res, code);
    res.body.data.should.have.properties('_id', 'title', 'description', 'code', 'type');
    if (values !== 'undefined') {
      res.body.data.should.have.properties(values)
    }
  },
  assertChain: (res, code, values) => {
    this.helper.assertResponseFields(res, code);
    res.body.data.should.have.properties('_id', 'title', 'description', 'nodes');
    if (values !== 'undefined') {
      // res.body.data.should.have.properties(values)
    }
  }
};