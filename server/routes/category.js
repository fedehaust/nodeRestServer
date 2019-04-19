const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const app = express();
const category = require('../models/category')