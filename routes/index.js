var express = require('express');
var router = express.Router();
var bc = require('../lib/bc');
var _ = require('lodash');
var Unakul = require('../lib/unakul');
var wongnaiEnum = require('../lib/wongnai/enum.js');
var getty = require('../lib/getty');
var pml = require('../lib/pml');

var MEMORY = {};

Unakul.callback = function(err, sender, msg){
	bc.sendText([sender], msg);
};

var fsm = require('../lib/fsm');
var client = require('../lib/wit_client');
var queryWongnai = require('../lib/wongnai/index.js');
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
			var firstRest = data[0];
			var url = "http://www.wongnai.com/" + firstRest.url;
			var msg = "Why don't you do eat at " + url;
			bc.sendText([mid], msg);
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

router.get('/foodboard', function(req,res){
	var foods = Object.keys(wongnaiEnum.raw.food);
	var nationalities = Object.keys(wongnaiEnum.raw.nationality);
	var combined = _.concat(foods, nationalities);
	
	for(var i = 0; i < combined.length; i++){
		// getty.getRandom("dish food " + combined[i]).then(function(data){ 
			
		// })
	}
	
	res.render('foodboard', {title: 'Foodboard', foods: combined})
});

router.post('/training', function(req,res){
	var body = req.body;
	var objectKeys = Object.keys(req.body);
	var output = {1: [], 3:[]};
	var mid = "0";
	var user = MEMORY[mid] || { w: {} };
	
	pml.learnTinder(output, user);
	
	for(var i = 0; i < objectKeys.length; i++){
		var genre = objectKeys[i];
		var score = req.body[genre];
		output[score].push(genre);
	}
	
	MEMORY[mid] = user;
	
	console.log(req.body);
});

router.post('/test', function(req,res){
	//u1abe46713713ecbc8b66b04691c354f9
	bc.sendLink(['u1abe46713713ecbc8b66b04691c354f9'], 'template1');
	res.send('ok');
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
				respondForState(fromMID, newState);
				console.log(fromMID, ' switched from ', currentState, ' to ', newState);
			} else {

				//Plain Text
				var text = result.content.text;
				var TEXT = text.toUpperCase();
				console.log('text = ' + text);
				console.log ('TEXT = ' + TEXT);
				console.log('indexOf = ' + MOVES.indexOf(TEXT));
				if (MOVES.indexOf(TEXT) >= 0) {
					console.log('command detected, moving with ' + TEXT);
					newState = fsm.clockNext(fromMID, TEXT);
					console.log(fromMID, ' switched from ', currentState, ' to ', newState);
					respondForState(fromMID, newState);
					return res.send('OK');
				}

				if (text.match(/hi pin/i)){
					console.log('reseting fsm for ', fromMID);
					newState = fsm.clockNext(fromMID, 'RESET');
					console.log(fromMID, ' switched from ', currentState, ' to ', newState);
					return res.send('OK');
				}

				client.message(text, {}, function(err, data){
					var en = data.entities;
					console.log(JSON.stringify(data, null, 2));
					keys = [getMove(currentState)];
					console.log('moving with ', keys);
					if (keys.length > 0) {
						newState = fsm.clockNext(fromMID, keys);
					}
					respondForState(fromMID, newState);
					console.log(fromMID, ' switched from ', currentState, ' to ', newState);
				});
			}
		} catch (err) {
			console.error(err.stack);
		}
	}
	
	res.send('OK');
});

module.exports = router;