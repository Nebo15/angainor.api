var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendJson({ title: 'Express' }, 201);
});

module.exports = router;
