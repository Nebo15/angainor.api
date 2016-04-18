var should = require('should');
var request = require('supertest');
var helper = require("./../helper").helper;

describe('Nodes', () => {

  it('Create and Update Node', done => {
    helper.createNode((res) => {
      var data = {
        _id: res.body.data._id,
        title: 'Updated title',
        code: 'Updated title'
      };

      request(helper.baseUrl)
        .put('/nodes/' + data._id)
        .send(data)
        .end((err, res) => {
          helper.assertNode(res, 200, data);
          done();
        });
    });
  });

  it('Delete Node', done => {
    helper.createNode((res) => {

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

  it('Respond with list of Nodes', done => {
    request(helper.baseUrl)
      .get('/nodes')
      .end((err, res) => {
        if (err) {
          throw err;
        }
        helper.assertNodesList(res);
        done()
      })
  });
});
