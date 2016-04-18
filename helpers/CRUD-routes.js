import Repository from './../helpers/repository';

export let initCRUDRoutes = (model, router) => {
  router.get('/', (req, res, next) => {
    Repository.readModelsList(model, (err, response) => {
      res.sendJson(response)
    });
  });

  router.get('/:id', (req, res, next) => {
    Repository.readModel(model, req.body.id, (err, response) => {
      response ?
      res.sendJson(response) :
      res.sendJsonError(404, 'Not found');
    });
  });

  router.post('/', (req, res, next) => {
    Repository.createModel(model, req.body, (err, response) => {
      res.sendJson(response, 201)
    })
  });

  router.put('/:id', (req, res, next) => {
    Repository.updateModel(model, req.params.id, req.body, (err, response) => {
      res.sendJson(response)
    })
  });

  router.delete('/:id', (req, res, next) => {
    Repository.deleteModel(model, req.params.id, (err, response) => {
      res.sendJson(response)
    })
  });
}

