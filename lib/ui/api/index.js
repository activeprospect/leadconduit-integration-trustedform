const express = require('express');
const { json } = require('body-parser');
const account = require('./account');

module.exports =
  express.Router()
    .use(json())
    .use('/account', account);
