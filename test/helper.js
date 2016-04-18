var request = require('supertest');

var Helper = {
  baseUrl: 'http://localhost:3000',
  getNodeData: () => {
    return {
      title: 'Test title node',
      description: 'Test desc node',
      type: 'code',
      trusted: true,
      code: '<?php die("hacked"); ?>'
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
  }
};

exports.helper = Helper;