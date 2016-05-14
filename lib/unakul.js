var TOKEN = 'MMNPQLFQYGLDFG2FN7W5FYCI5L5EZZJR'; // pinacolada


var Logger = require('node-wit').Logger;
var levels = require('node-wit').logLevels;
var Wit = require('node-wit').Wit;
var sayCallback = null;
var _ = require('lodash');
var logger = null;
if (process.env.DEBUG) {
  console.log('Unakul will be debugging this session');
  logger = new Logger(levels.DEBUG);
} else {
  logger = new Logger(levels.ERROR);
}
var actions = {
  say: function(sessionId, context, message, cb) {
    console.log('Pin: ' + message);
    if (sayCallback) {
      sayCallback(null, message);
    }
    cb();
  },
  merge: function(sessionId, context, entities, message, cb) {
    cb(context);
  },
  error: function(sessionId, context, error) {
    console.log(error.message);
  },
  getSuggestions: function(sessionId, context, cb) {
    context.aSuggestion = 'After You.'
    cb(context)
  },
  getGreeting: function(sessionId, context, cb) {
    sample = [
      'Helloooooooo >W<',
      'Wassup Bro.',
      'Wasssaappppp'
    ]
    context.aGreeting = _.sample(sample);
    cb(context);
  }

};


var client = new Wit(TOKEN, actions, logger);
module.exports = {
  /*
  * 
  * 
  * 
   */
  receiveMessage: function(msg, sessionId, callback) {
    console.log(JSON.stringify(this, null, 2));
    if (typeof context === 'undefined' || context === null) context = {};

    client.converse(sessionId, msg, context, (error, data) => {
      if (error) {
        console.log('Oops! Got an error: ' + error);
      } else {
        console.log('Yay, got Wit.ai response: ' + JSON.stringify(data));
      } 
      if (callback) callback(error, data);
    });
  },
  client: client,
  setSayCallback: function(cb) {
    sayCallback = cb;
  }

};