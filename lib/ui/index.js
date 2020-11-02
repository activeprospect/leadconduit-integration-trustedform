const express = require('express');
const path    = require('path');

let router = express.Router()
  .use(express.static(path.join(__dirname, '/public')));

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  router.use(require('./webpack'));
}

module.exports = router;
