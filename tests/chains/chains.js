var should = require('should');
var request = require('supertest');
import helper from './../Helper';
var Helper = new helper();

describe('Chains', () => {

  it('Create and Update Chain', done => {
    Helper.createChain((res) => {
      var data = {
        _id: res.body.data._id,
        title: 'Updated chain title',
        description: 'Updated chain description',
        invalid: 'invalid field'
      };
  
      request(Helper.baseUrl)
        .put('/chains/' + data._id)
        .send(data)
        .end((err, res) => {
          Helper.assertChain(res, 200, {
            title: 'Updated chain title',
            description: 'Updated chain description'
          });
          res.body.data.should.not.have.property('invalid');
          done();
        });
    });
  });
  
  it('Delete Chain', done => {
    Helper.createChain((res) => {
      var id = res.body.data._id;
      request(Helper.baseUrl)
        .delete('/chains/' + id)
        .end((err, res) => {
          Helper.assertResponseFields(res, 200);
          request(Helper.baseUrl)
            .get('/chains/' + id)
            .end((err, res) => {
              Helper.assertResponseErrorFields(res, 404);
              done();
            });
        });
    });
  });
  
  it('Respond with list of Chains', done => {
    request(Helper.baseUrl)
      .get('/chains')
      .end((err, res) => {
        if (err) {
          throw err;
        }
        Helper.assertChainsList(res);
        done();
      })
  });

  it('Execute chain', done => {
    Helper.createChain((res) => {
      var id = res.body.data._id;
      request(Helper.baseUrl)
        .post('/chains/' + id + '/execute')
        .send({amount: 100, borrowers_phone_verification: "okay", "contact_person_phone_verification": "go"})
        .end((err, res) => {
          Helper.assertResponseFields(res, 200);
          res.body.data.should.have.properties({
            'amount': 105,
            'branch': 'first',
            'lunch': 'second',
            'final': 'finish'
          });
          done();
        });
    });
  });
});
