var TOKEN = 'MMNPQLFQYGLDFG2FN7W5FYCI5L5EZZJR';

var Logger = require('node-wit').Logger;
var levels = require('node-wit').logLevels;
var Wit = require('node-wit').Wit;

var logger = new Logger(levels.DEBUG);
var actions = {
  say: function(sessionId, context, message, cb) {
    console.log(message);
    cb();
  },
  merge: function(sessionId, context, entities, message, cb) {
    cb(context);
  },
  error: function(sessionId, context, error) {
    console.log(error.message);
  },
  'fetch-weather': function(sessionId, context, cb) {
    // Here should go the api call, e.g.:w
    // context.forecast = apiCall(context.loc)
    context.forecast = 'sunny';
    cb(context);
  },
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
      callback(error, data);
    });
  }
};