var should = require('should');
var request = require('supertest');

import helper from "./../helper";

describe('Chains', () => {

  it('Create and Update Chain', done => {
    helper.createChain((res) => {
      var data = {
        _id: res.body.data._id,
        title: 'Updated chain title',
        description: 'Updated chain description',
        invalid: 'invalid field'
      };

      request(helper.baseUrl)
        .put('/chains/' + data._id)
        .send(data)
        .end((err, res) => {
          // helper.assertChain(res, 200, {
          //   title: 'Updated chain title',
          //   description: 'Updated chain description'
          // });
          // res.body.data.should.not.have.property('invalid');
          done();
        });
    });
  });

  it('Delete Chain', done => {
    helper.createChain((res) => {

      var id = res.body.data._id;
      request(helper.baseUrl)
        .delete('/nodes/' + id)
        .end((err, res) => {
          helper.assertResponseFields(res, 200);
          request(helper.baseUrl)
            .get('/nodes/' + id)
            .end((err, res) => {
              helper.assertResponseErrorFields(res, 404);
              done();
            });

        });
    });
  });

  it('Respond with list of Chains', done => {
    request(helper.baseUrl)
      .get('/chains')
      .end((err, res) => {
        if (err) {
          throw err;
        }
        helper.assertChainsList(res);
        done()
      })
  });
});
