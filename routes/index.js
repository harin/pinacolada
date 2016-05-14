var express = require('express');
var router = express.Router();
var bc = require('./lib/bc');
var _ = require('lodash');

router.get('/', function(req,res){
	res.send('PIN is up.');
});

/* GET home page. */
router.post('/callback', function(req, res) {
	console.log('called back', req.body.result);
	
	
	req.body.result.forEach(function(result){
		var isLocation = _.has(result.content, 'location.latitude');
		var sender = result.content.from;
		
		if(isLocation){
			var location = result.content.location;
			bc.sendText(sender, 'You sent me a location ' + location.latitude + ", " + location.longitude);
		}else{
			//Plain Text
			var text = result.content.text;
			bc.sendText(sender, 'You sent me ' + text);
		}
	
	});

	
	

});

module.exports = router;
