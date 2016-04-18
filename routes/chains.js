import {initCRUDRoutes} from './../helpers/CRUD-routes';

var express = require('express');
var router = express.Router();

var Chain = require('../models/node');

initCRUDRoutes(Chain, router);