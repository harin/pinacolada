var express = require('express');
var router = express.Router();
var bc = require('../lib/bc');
var _ = require('lodash');
var fsm = require('../lib/fsm');
var client = require('../lib/wit_client');

router.get('/', function(req,res){
  res.send('PIN is up.');
});

/* GET home page. */
router.post('/callback', function(req, res) {
  var fromMID = req.body.mid;
  //Plain Text
  var text = req.body.text;
  client.message(text, {}, function(err, data){
    var en = data.entities;
    var keys = Object.keys(en).map(function(key) {
      return key.toUpperCase();
    });
    var currentState = fsm.getState(fromMID);
    var state = fsm.clockNext(fromMID, keys);
    console.log(fromMID, ' switched from ', currentState, ' to ', state);
    res.status(200).json(keys);
  });
});

module.exports = router;