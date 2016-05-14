var express = require('express');
var router = express.Router();
var unirest = require('unirest');
var wit = require('node-wit');
var Unakul = require('../lib/unakul.js');

router.get('/', function(req,res){
  res.send('PIN is up.');
});

router.post('/', function(req, res) {
  Unakul.receiveMessage(req.body.message, 1, (err, data) => {
    res.status(200).json(data);
  });
});

module.exports = router;
