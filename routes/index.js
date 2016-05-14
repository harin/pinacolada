var express = require('express');
var router = express.Router();
var bc = require('../lib/bc');
var _ = require('lodash');
var Unakul = require('../lib/unakul');
Unakul.setSayCallback(function(err, resp){
	bc.sendText(sender, resp);
});

router.get('/', function(req,res){
	res.send('PIN is up.');
});

/* GET home page. */
router.post('/callback', function(req, res) {
	console.log('called back', req.body.result);
	
	for(var i = 0 ;i < req.body.result.length; i++){
		var result = req.body.result[i];
		var isLocation = _.has(result.content, 'location.latitude');
		var sender = [result.content.from];
		
		if(isLocation){
			// var location = result.content.location;
			// bc.sendText(sender, 'You sent me a location ' + location.latitude + ", " + location.longitude);
			// 
		}else{
			//Plain Text
			var text = result.content.text;
			Unakul.receiveMessage(text, result.content.from, null);
		}
	}
	
	res.send('OK');


});

module.exports = router;
