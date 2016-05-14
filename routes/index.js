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
	
	console.log('called back', req.body.result);
	
	for(var i = 0 ;i < req.body.result.length; i++){
		var result = req.body.result[i];
		var isLocation = _.has(result.content, 'location.latitude');
		var fromMID = result.content.from;

		if(isLocation){
			var location = result.content.location;
			// bc.sendText(sender, 'You sent me a location ' + location.latitude + ", " + location.longitude);
		}else{
			//Plain Text
			var text = result.content.text;
			client.message(text, {}, function(err, data){
				var en = data.entities;
				var keys = Object.keys(en);
				var currentState = fsm.getState(fromMID);
				var state = fsm.clockNext(fromMID, keys);
				console.log(fromMID, ' switched from ', currentState, ' to ', state);
			});
		}
	}
	
	res.send('OK');
});

module.exports = router;