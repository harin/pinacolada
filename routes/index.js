var express = require('express');
var router = express.Router();
var Promise = require('bluebird');

var bc = require('../lib/bc');
var _ = require('lodash');
var wongnaiEnum = require('../lib/wongnai/enum.js');
var getty = require('../lib/getty');
var pml = require('../lib/pml');

var MEMORY = {};

var fsm = require('../lib/fsm');
var client = require('../lib/wit_client');
var queryWongnai = require('../lib/wongnai/index.js');
var userState = {};

var DEBUG = true;
if (process.env.NODE_ENV === 'production') {
	DEBUG = false;
}

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

var MOVES = ['INQUIRY', 'LOCATION', 'SATISFIED', 'FEEDBACK'
							, 'RESET', 'UNSATISFIED', 'SURPRISE', 'CUISINE'];

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

var sendText = function(mids, msg) {
	if (DEBUG) {
		console.log(mids, msg);
	} else {
		bc.sendText(mids, msg);
	}
}

var textToAction = function(text, state) {
	return new Promise(function(resolve, reject) {
		var TEXT = text.toUpperCase();
		console.log ('TEXT = ' + TEXT);
		if (MOVES.indexOf(TEXT) >= 0) {
			return resolve([TEXT]);
		}

		if (text.match(/hi pin/i)){
			console.log('matched hi pin');
			return resolve(['RESET']);
		}

		client.message(text, {}, function(err, data){
			var en = data.entities;
			console.log(JSON.stringify(data, null, 2));
			keys = [getMove(state)];
			if (keys.length > 0) {
				return resolve(keys);
			}
		});
	});
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
		var query = sampleQuery;
		if (state.location) {
			query = {
				latitude: state.location.latitude,
				longitude: state.location.longitude
			}
		}
		console.log('querying wongnai with ' + query);
		return queryWongnai(query).then(function(data){
			var rest = null;
			if (userState[mid].suggestedCount == 0) {
				rest = data[0];
			} else {
				rest = _.sample(data);
			}
			var url = "http://www.wongnai.com/" + rest.url;
			var msg = "Why don't you do eat at " + url;
			sendText([mid], msg);
			userState[mid].suggestedCount++;
			return null;
		})
		.catch(function(err) {
			console.error(err.stack);
			return null;
		});
	} else if (state === 'DONT_UNDERSTAND') {
		msg = "Sorry, I don't understand."
	}

	console.log("sending ", msg, " to ", mid);
	sendText([mid], msg);
	return null;
}

var ensureUserState = function(mid) {
	if (!userState[mid]) {
		userState[mid] = {
			suggestedCount: 0
		}
	}
}

var updateUserState = function(mid, object) {
	ensureUserState(mid);
	_.merge(userState[mid], object);
	console.log(userState[mid]);
}

router.get('/', function(req,res){
	res.send('PIN is up.');
});

router.get('/foodboard', function(req,res){
	var foods = Object.keys(wongnaiEnum.raw.food);
	var nationalities = Object.keys(wongnaiEnum.raw.nationality);
	var combined = _.concat(foods, nationalities);
	var mid = req.query.mid;
	
	res.render('foodboard', {title: 'Foodboard', foods: combined, mid: mid})
});

router.post('/training', function(req,res){
	var objectKeys = Object.keys(req.body.likeness);
	var output = {1: [], 3:[]};
	var mid = req.body.mid;
	var user = MEMORY[mid] || { w: {} };
	
	pml.learnTinder(output, user);
	
	for(var i = 0; i < objectKeys.length; i++){
		var genre = objectKeys[i];
		var score = req.body.likeness[genre];
		output[score].push(genre);
	}
	
	bc.sendText([mid], "That's very interesting. ");
	MEMORY[mid] = user;
	
	res.send('tinder done');
});

router.post('/test', function(req,res){
	//u1abe46713713ecbc8b66b04691c354f9
	bc.sendLink(['u1abe46713713ecbc8b66b04691c354f9'], 'template1');
	res.send('ok');
});

/* GET home page. */
router.post('/callback', function(req, res) {
	
	console.log('called back', JSON.stringify(req.body.result,null,2));
	
	// create mock line response
	if (DEBUG) {
		req.body.result = [
			{
				content: {
					from: '123'
				}
			}
		]

		if (req.body.text) {
			req.body.result[0].content.text = req.body.text;
		}

		if (req.body.location) {
			req.body.result[0].content.location = req.body.location;
		}

		console.log(JSON.stringify(req.body,null,2));
	}

	try {
		var result = req.body.result[0];
		var isLocation = _.has(result.content, 'location.latitude');
		var fromMID = result.content.from;
		var currentState = fsm.getState(fromMID);
		var newState = currentState;

		ensureUserState(fromMID);

		if (userState[fromMID].suggestedCount >= 3) {
			console.log(userState[fromMID].suggestedCount);
			msg = "You're TOO hard to please! I'M DONE!"
			sendText([fromMID], msg);
			return res.send('OK');
		}

		if (currentState === 'WAIT_LOCATION' && !isLocation) {
			msg = "I'm waiting for your location :(";
			// ask user for location
			sendText([fromMID], msg);
			return res.send('OK');
		}

		console.log('isLocation =', isLocation);
		console.log('currentState =', currentState);

		if (isLocation) {
			var location = result.content.location;
			newState = fsm.clockNext(fromMID, ['LOCATION']);
			console.log('newState=', newState);
			updateUserState(fromMID, {
				location: location
			});
			respondForState(fromMID, newState);
			console.log(fromMID, ' switched from ', currentState, ' to ', newState);
			return res.send('OK');
		} else {
			//Plain Text
			var text = result.content.text;
			textToAction(text, currentState)
			.then(function(actions){

				if (actions.indexOf('SATISFIED') >= 0) {
					// reset suggested count
					userState[fromMID].suggestedCount = 0;
				}

				console.log('actions = ' + actions);
				newState = fsm.clockNext(fromMID, actions);
				console.log(fromMID, ' switched from ', currentState, ' to ', newState);
				respondForState(fromMID, newState);
				res.send('OK');
			})
			.catch(function(err){
				console.error(err.stack);
				res.sendStatus(500);
			});
		}
	} catch (err) {
		console.error(err.stack);
		res.sendStatus(500);
	}
});

module.exports = router;