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


var getMove = function(currentState) {
	if (currentState === 'IDLE') {
		return 'INQUIRY'
	} else if (currentState === 'WAIT_LOCATION') {
		return 'LOCATION'
	} else if (currentState === 'SUGGEST') {
		return 'SATISFIED'
	} else if (currentState === 'FEEDBACK') {
		return 'FEEDBACK'
	} else if (currentState ===' DONT_UNDERSTAND' ) {
		return 'RESET';
	} else {
		return 'RESET';
	}
}

var respondForState = function(mid, state) {
	var msg = null;
	if (state === 'IDLE') {
		msg = 'How can I help you today';
	} else if (state === 'WAIT_LOCATION') {
		msg = 'Send me your location'; 
	} else if (state === 'SUGGEST') {
		// build query from user state
		var state = userState[mid];

		return query(sampleQuery).then(function(data){
			console.log(data);
		});
	} else if (state === 'DONT_UNDERSTAND') {
		msg = "Sorry, I don't understand."
	}

	console.log("sending ", msg, " to ", mid);
	bc.sendText([mid], msg);
}

var updateState = function(mid, object) {
	if (!userState[mid]) userState[mid] = {};
	_.merge(userState[mid], object);
	console.log(userState[mid]);
}

router.get('/', function(req,res){
	res.send('PIN is up.');
});

/* GET home page. */
router.post('/callback', function(req, res) {
	
	console.log('called back', JSON.stringify(req.body.result,null,2));
	
	for(var i = 0 ;i < req.body.result.length; i++){
		try {
			var result = req.body.result[i];
			var isLocation = _.has(result.content, 'location.latitude');
			var fromMID = result.content.from;
			var currentState = fsm.getState(fromMID);
			var newState = currentState;

			if (currentState === 'WAIT_LOCATION' && !isLocation) {
				// ask user for location
				bc.sendText([fromMID], "I'm waiting for your location :/");
				return res.send('OK');
			}

			if (isLocation && currentState === 'WAIT_LOCATION'){

				var location = result.content.location;
				respondForState(fromMID, currentState);
				newState = fsm.clockNext(fromMID, ['LOCATION']);
				updateState(fromMID, {
					location: location
				});

			} else {

				//Plain Text
				var text = result.content.text;
				client.message(text, {}, function(err, data){
					var en = data.entities;
					console.log(JSON.stringify(data, null, 2));
					// var keys = Object.keys(en).map(function(val) {
					// 	return val.toUpperCase();
					// });

					keys = [getMove(currentState)];
					console.log('moving with ', keys);
					if (keys.length > 0) {
						newState = fsm.clockNext(fromMID, keys);
					}
				});
			}
			console.log(fromMID, ' switched from ', currentState, ' to ', newState);
			respondForState(fromMID, newState);
		} catch (err) {
			console.error(err.stack);
		}
	}
	
	res.send('OK');
});

module.exports = router;