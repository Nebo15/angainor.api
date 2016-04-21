var should = require('should');
var request = require('supertest');
import helper from './../helper';
var Helper = new helper();

describe('Nodes', () => {

  it('Create and Update Node', done => {
    Helper.createNode((res) => {
      var data = {
        _id: res.body.data._id,
        title: 'Updated title',
        code: 'Updated title'
      };

      request(Helper.baseUrl)
        .put('/nodes/' + data._id)
        .send(data)
        .end((err, res) => {
          Helper.assertNode(res, 200, data);
          done();
        });
    });
  });

  it('Delete Node', done => {
    Helper.createNode((res) => {

      var id = res.body.data._id;
      request(Helper.baseUrl)
        .delete('/nodes/' + id)
        .end((err, res) => {
          Helper.assertResponseFields(res, 200);
          request(Helper.baseUrl)
            .get('/nodes/' + id)
            .end((err, res) => {
              Helper.assertResponseErrorFields(res, 404);
              done();
            });
        });
    });
  });

  it('Respond with list of Nodes', done => {
    request(Helper.baseUrl)
      .get('/nodes')
      .end((err, res) => {
        if (err) {
          throw err;
        }
        Helper.assertNodesList(res);
        done()
      })
  });
});
