import {initCRUDRoutes} from './../helpers/CRUD-routes';

var express = require('express');
var router = express.Router();
var Node = require('../models/node');

initCRUDRoutes(Node, router);

module.exports = router;