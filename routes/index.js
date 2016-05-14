var express = require('express');
var router = express.Router();
var unirest = require('unirest');

router.get('/', function(req,res){
	res.send('PIN is up.');
});

/* GET home page. */
router.post('/callback', function(req, res) {
	console.log('called back', req.body.result);
	// console.log('called back 2', req.body.result[0]['content']);

	var hello = "Hi I'm Pin. You said " + req.body.result[0]['content']['text'];
	var frm = req.body.result[0].content.from;
	
	unirest.post('https://api.line.me/v1/events')
	.headers({ 'Content-Type' : 'application/json; charset=UTF-8', 
		'X-LINE-ChannelToken' : 'GVkmAjF35ITv/o+20viSyJ3llXhudOoQATN85TxReCihmYLI0TdcyAOoU+kmAXVZFI0U9XUE7NNBSf3dvvxommf6VRYr+LcZ06yMu5lL8EgvJzXgPp7lcmUKUa6mJR3EKloHD0ie/kZNvjxtSXRVrq18BSl7lGXPAT9HRw/DX2c='
	})
	.send({
		  "to":[frm],
	 	  "toChannel":1383378250,
	  	  "eventType":"138311608800106203",
	  	  "content":{
			  "contentType": 1,
			  "toType": 1,
			  "text": hello	
		  }
	})
	.end(function(msg){
		res.send("OK");
	});


});

module.exports = router;
