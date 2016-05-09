var express = require('express');
var router = express.Router();
var unirest = require('unirest');

/* GET home page. */
router.post('/callback', function(req, res) {
	console.log('called back', req.body.result);
	console.log('called back 2', req.body.result[0]['content']);

	var hello = "Hi I'm Pin. You said" + req.body.result[0]['content']['text'];
	var frm = req.body.result[0].from;	

	unirest.post('https://trialbot-api.line.me/v1/events')
	.headers({ 'Content-Type' : 'application/json; charset=UTF-8', 
		   'X-Line-ChannelID' : '1466986405',
		   'X-Line-ChannelSecret': '49dfcac9951abf6c6027c078065c24ee',
		   'X-Line-Trusted-User-With-ACL': 'u3f49485a12a13764c9b80d37b9525757'
	})
	.send({
		  "to":[frm],
	 	  "toChannel":1383378250,
	  	  "eventType":"138311608800106203",
	  	  "content":{
			  "contentType": 1,
			  "text": hello	
		  }
	})
	.end(function(msg){
		console.log(msg.body);
		res.send("OK");
	});


});

module.exports = router;
