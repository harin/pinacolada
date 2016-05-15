var express = require('express');
var config = require('../config.js');
var router = express.Router();
var Promise = require('bluebird');
var gm = require('gm').subClass({ imageMagick: true });
var request = require('request');
var fs = require('fs');
var unirest = require('unirest');

var bc = require('../lib/bc');
var _ = require('lodash');
var wongnaiEnum = require('../lib/wongnai/enum.js');
var getty = require('../lib/getty');
var pml = require('../lib/pml');
var pinResp = require('../lib/response');

var MEMORY = {};
var HISTORY = {};

var fsm = require('../lib/fsm');
var client = require('../lib/wit_client');
var queryWongnai = require('../lib/wongnai/index.js');
var wongnai = "https://www.wongnai.com";
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
var NORMAL_MOVES = ['INQUIRY', 'LOCATION', 'SATISFIED', 'FEEDBACK',
	, 'RESET', 'UNSATISFIED'];

var QUERY_WEIGHT = {
	'INQUIRY': 1,
	'LOCATION': 2,
	'SATISFIED': 3,
	'UNSATISFIED': 4,
	'FEEDBACK': 5,
	'RESET': 6
};

var VALID_QUERY_KEYS = [
	'latitude', 'longitude', 'radius',
	'nationality', 'food', 'business',
	'alcohol', 'parking', 'sort',
	'open', 'discount', 'price'
]

var VALID_Q_ATTRIBUTES = [
	'nationality',
	'food',
	'business',
	'alcohol',
	'parking',
	'open',
	'discount',
	'price'
]

var SUGGEST_LIMIT = 10;

var sendText = function(mids, msg) {
	if (DEBUG) {
		console.log(mids, msg);
	} else {
		bc.sendText(mids, msg);
	}
}

var textToAction = function (mid, text, state) {
	return new Promise(function (resolve, reject) {
		var TEXT = text.toUpperCase();
		console.log('TEXT = ' + TEXT);
		if (MOVES.indexOf(TEXT) >= 0) {
			return resolve([TEXT]);
		}

		if (text.match(/hi pin/i)) {
			console.log('matched hi pin');
			return resolve(['RESET']);
		}

		text = text.toLowerCase();
		client.message(text, {}, function (err, data) {
			var entities = data.entities;
			console.log(JSON.stringify(data, null, 2));

			keys = Object.keys(entities);
			// keys = [getMove(state)];
			if (state === 'SUGGEST') {
				// build user overridden preference
				if (keys.indexOf('UNSATISFIED') >= 0) {
					sendText([mid], pinResp.UNSATISFIED());
					obj = {}
					keys.forEach(function (key) {
						if (VALID_QUERY_KEYS.indexOf(key) >= 0) {
							var entity = entities[key];
							if (Array.isArray(entity)) {
								obj[key] = entity.map(function (val) {
									if (typeof val.value === 'object') {
										return val.value.value;
									} else {
										return val.value;
									}
								});
							} else {
								obj[key] = entities[key].value;
							}
						}
					});
					console.log('updating with ', obj);
					updateUserState(mid, obj);
					console.log ('result = ', userState[mid]);
				}
			} else if (state === 'FEEDBACK') {
				alpha = null;
				if (keys.indexOf('SATISFIED') >= 0) {
					alpha = 1;
					sendText([mid], pinResp.SATISFIED_FEEDBACK());
				} else if (keys.indexOf('UNSATISFIED') >= 0) {
					alpha = -1;
					sendText([mid], pinResp.UNSATISFIED_FEEDBACK());
				}
				var query = userState[mid].lastSuggestion;
				console.log('last suggestion', query);
				var passQuery = MEMORY[mid] || { w: {} };
				learnedQuery = pml.learnInput(query, passQuery, alpha);
				MEMORY[mid] = learnedQuery;

				if (!HISTORY[mid]) {
					HISTORY[mid] = [];
				}

				//Save to history
				HISTORY[mid].push(query);

				keys = ['FEEDBACK'];
			}

			keys = keys.map(function (key) {
				return key.toUpperCase();
			}).filter(function (key) {
				return NORMAL_MOVES.indexOf(key) >= 0;
			}).sort(function (a, b) {
				if (QUERY_WEIGHT[a] && QUERY_WEIGHT[b])
					return QUERY_WEIGHT[a] > QUERY_WEIGHT[b];
				else
					return 0;
			});

			return resolve(keys);
		});
	});
}

var askFeedback = function (mid) {
	userState[mid].waitingForFeedback = false;
	msg = pinResp.FEEDBACK();
	sendText([mid], msg);
}

var respondForState = function (mid, state) {
	var msg = null;
	if (state === 'IDLE') {
		msg = pinResp.IDLE();
	} else if (state === 'WAIT_LOCATION') {
		msg = pinResp.WAIT_LOCATION();
	} else if (state === 'SUGGEST') {
		// build query from user state
		var state = userState[mid];
		var userQuery = {};
		var query = {
			latitude: state.location.latitude,
			longitude: state.location.longitude
		}
		userQuery = _.pick(state, VALID_Q_ATTRIBUTES);
		query = _.assign(query, userQuery);

		var passQuery = MEMORY[mid] || { w: {} };
		learnedQuery = pml.learnInput(query, passQuery);
		MEMORY[mid] = learnedQuery;

		console.log('state ', state);
		console.log('userQuery ', userQuery);
		var activeQuery = null;
		if (Object.keys(userQuery).length > 0) {
			console.log('using unlearned query');
			activeQuery = query;
		} else {
			console.log('using learned query');
			activeQuery = learnedQuery;
		}

		userState[mid].lastSuggestion = activeQuery;
		sendText([mid], pinResp.SUGGEST_LOOKUP());
		console.log('querying wongnai with ' + JSON.stringify(activeQuery));
		return queryWongnai(activeQuery).then(function (data) {
			var rest = null;
			var count = userState[mid].suggestedCount;
			if (data.length > count) {
				rest = data[count];
			} else {
				rest = _.sample(data);
			}

			console.log(data.map(function (rest) {
				return {
					name: rest.displayName,
					priceRange: rest.priceRange.name
				}
			}));

			var msg = pinResp.SUGGEST(rest)

			var intros = [
				'What about this instead?',
				'This also looks good!'
			]
			var intro = '';
			if (count === 0) {
				intro = 'How about this?'
			} else {
				intro = _.sample(intros);
			}

			sendText([mid], '' + intro + " It's priced at around " + msg.price + " THB");
			bc.sendLink2([mid], 'wong1', msg.name, msg.url);

			// bc.sendImage([mid], rest, 0);
			// bc.sendImage([mid], rest, 1);
			// bc.sendImage([mid], rest, 2);
			// bc.sendImage([mid], rest, 3);
			userState[mid].suggestedCount++;
			return null;
		})
			.catch(function (err) {
				console.error(err.stack);
				return null;
			});
	} else if (state === 'FEEDBACK') {
		if (typeof userState[mid].waitingForFeedback === 'undefined') {
			userState[mid].waitingForFeedback = true;
			setTimeout(function () {
				askFeedback(mid)
			}, 15000);
		}
	} else if (state === 'DONT_UNDERSTAND') {
		msg = pinResp.DONT_UNDERSTAND();
	}

	console.log("sending ", msg, " to ", mid);
	sendText([mid], msg);
	return null;
}

var ensureUserState = function (mid) {
	if (!userState[mid]) {
		userState[mid] = {
			suggestedCount: 0
		}
	}
}

var updateUserState = function (mid, object) {
	ensureUserState(mid);
	_.merge(userState[mid], object);
	console.log(userState[mid]);
}

router.get('/')

router.get('/', function (req, res) {
	res.send('PIN is up.');
});

router.get('/foodboard', function (req, res) {
	var foods = Object.keys(wongnaiEnum.raw.food);
	var nationalities = Object.keys(wongnaiEnum.raw.nationality);
	var combined = _.concat(foods, nationalities);
	var mid = req.query.mid;

	combined = _.pull(combined, 'international', 'others', 'quick meal', 'beverage');

	res.render('foodboard', { title: 'Foodboard', foods: combined, mid: mid })
});

router.post('/training', function (req, res) {
	var objectKeys = Object.keys(req.body.likeness);
	var output = { 1: [], 3: [] };
	var mid = req.body.mid;
	var user = MEMORY[mid] || { w: {} };

	pml.learnTinder(output, user);

	pml.learnTinder({
		1: ['japanese', 'french', 'fastfood'],
		3: ['indian']
	}, user);

	for (var i = 0; i < objectKeys.length; i++) {
		var genre = objectKeys[i];
		var score = req.body.likeness[genre];
		output[score].push(genre);
	}

	MEMORY[mid] = user;
	bc.sendText([mid], "That's very interesting.");

	var xdict = pml.parseTinder(output);
	var ah = xdict['3'];

	if (ah['nationality'].length == 0 && ah['food'].length == 0) {
		ah = xdict['1'];
	}

	var answer = 'nothing in particular..';

	console.log(xdict, 'xdict');

	var stuff = [];
	_.forOwn(xdict, function (v, k) {
		_.forOwn(v, function (v2, k2) {
			_.forEach(v2, function (e) {
				if (k2 == 'nationality') {
					stuff.push(_.capitalize(e + ' food'));
				} else {
					stuff.push(_.capitalize(e));
				}
			});
		});
	});

	answer = stuff[_.floor(Math.random() * stuff.length)]

	console.log(stuff, 'stuff');

	bc.sendText([mid], "You seem to like " + (answer));
	fsm.idle(mid);

	console.log(pml.output(MEMORY[mid]));
	console.log(pml.output(MEMORY[mid]));
	console.log(pml.output(MEMORY[mid]));

	res.send('tinder done', output);
});


/* GET home page. */
router.post('/callback', function (req, res) {

	console.log('called back', JSON.stringify(req.body.result, null, 2));

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

		console.log(JSON.stringify(req.body, null, 2));
	}

	try {
		var result = req.body.result[0];
		var isLocation = _.has(result.content, 'location.latitude');
		var fromMID = result.content.from;
		var currentState = fsm.getState(fromMID);
		var newState = currentState;

		ensureUserState(fromMID);

		if (userState[fromMID].waitingForFeedback) {
			return res.send('OK');
		}

		if (userState[fromMID].suggestedCount >= SUGGEST_LIMIT) {
			console.log(userState[fromMID].suggestedCount);
			msg = pinResp.SUGGEST_LIMIT();
			sendText([fromMID], msg);
			return res.send('OK');
		}

		if (currentState === 'WAIT_LOCATION' && !isLocation) {
			msg = pinResp.WAIT_LOCATION_REPEAT()
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
			textToAction(fromMID, text, currentState)
				.then(function (actions) {
					console.log('actions ', actions);
					if (actions.indexOf('SATISFIED') >= 0) {
						// reset suggested count
						userState[fromMID].suggestedCount = 0;
						sendText([fromMID], pinResp.SATISFIED_SUGGEST());
					}

					console.log('actions = ' + actions);
					newState = fsm.clockNext(fromMID, actions);
					console.log(fromMID, ' switched from ', currentState, ' to ', newState);
					respondForState(fromMID, newState);
					res.send('OK');
				})
				.catch(function (err) {
					console.error(err.stack);
					res.sendStatus(500);
				});
		}
	} catch (err) {
		console.error(err.stack);
		res.sendStatus(500);
	}
});

//rid == restaurant id
//indx = nth photo
router.get('/restaurants/:rid/:indx/:size', function (req, res) {
	unirest.get(wongnai + '/restaurants/' + req.params.rid + '/photos.json')
		.headers({
			'Content-Type': 'application/json'
		})
		.encoding('utf-8')
		.end(function (r) {
			if (r.statusType < 3) {
				var idx = _.toInteger(req.params.indx);
				var size = _.toInteger(req.params.size);
				res.set('Content-Type', 'image/jpeg');
				gm(request.get(r.body.page.entities[idx].smallUrl))
					.resize(size)
					.stream(function (err, stdout, stderr) {
						if (err) {
							console.log(err);
							res.sendStatus(404)
						} else {
							stdout.pipe(res);
						}
					})

			} else {
				res.sendStatus(404);
			}
		});
});

module.exports = router;