var express = require('express');
var router = express.Router();
var bc = require('../lib/bc');
var _ = require('lodash');
var fsm = require('../lib/fsm');
var client = require('../lib/wit_client');
var query = require('../lib/wongnai/index.js');
var userState = {};

var sampleQuery = {
  "latitude": 10.000033,
  "longitude": 12.0003,
  "radius": 2.0, //KM?
  "nationality": ["japanese", "thai"],
  "food": ["ice cream", "fastfood"],
  "business": ["street food", "food truck"],
  "alcohol": ["wine"],
  "parking": ["no parking"],
  "sort": "best match",
  "open": true,
  "discount": true,
  "page": {
    "number": 2, //start with 1
    "size": 20
  },
  "campaign": "ais",
  "price": [125, 100] //Set of prices, will use max() and min() or only max() if length == 1
};

var respondForState = function(mid, state) {
	var msg = null;
	if (state === 'IDLE') {
		msg = 'How can I help you today';
	} else if (state === 'WAIT_LOCATION') {
		msg = 'Send me your location'; 
	} else if (state === 'SUGGEST') {
		return query(sampleQuery).then(function(data){
			console.log(data);
		});
	} else if (state === 'DONT_UNDERSTAND') {
		msg = "Sorry, I don't understand."
	}
	console.log("sending ", msg, " to ", mid);
	bc.sendText(mid, msg);
}

var updateState = function(mid, object) {
	if (!userState[mid]) userState[mid] = {};
	_.merge(userState[mid], object);
}

router.get('/', function(req,res){
	res.send('PIN is up.');
});

/* GET home page. */
router.post('/callback', function(req, res) {
	
	console.log('called back', JSON.stringify(req.body.result,null,2));
	
	for(var i = 0 ;i < req.body.result.length; i++){
		var result = req.body.result[i];
		var isLocation = _.has(result.content, 'location.latitude');
		var fromMID = result.content.from;
		var currentState = fsm.getState(fromMID);

		if (currentState === 'WAIT_LOCATION' && !isLocation) {
			// ask user for location
			bc.sendText(fromMID, "I'm waiting for your location :/");
			return res.send('OK');
		}

		if(isLocation){
			var location = result.content.location;

			// bc.sendText(sender, 'You sent me a location ' +
			//  location.latitude + ", " 
			//  + location.longitude);
		}else{

			//Plain Text
			var text = result.content.text;

			// keys = [text.toUpperCase()];
			// var newState = fsm.clockNext(fromMID, keys);
			// respondForState(fromMID, newState);
			// updateState(fromMID, object);
			// console.log(fromMID, ' switched from ', currentState, ' to ', newState);
			// return res.send('OK');

			client.message(text, {}, function(err, data){
				var en = data.entities;
				console.log(JSON.stringify(data, null, 2));
				var keys = Object.keys(en);
				var object = {};
				var newState = fsm.clockNext(fromMID, keys);
				console.log(fromMID, ' switched from ', currentState, ' to ', newState);

				respondForState(fromMID, newState);
				updateState(fromMID, object);
			});
		}
	}
	
	res.send('OK');
});

module.exports = router;