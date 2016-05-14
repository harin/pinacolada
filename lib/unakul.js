var TOKEN = 'MMNPQLFQYGLDFG2FN7W5FYCI5L5EZZJR'; // pinacolada


var Logger = require('node-wit').Logger;
var levels = require('node-wit').logLevels;
var Wit = require('node-wit').Wit;
var _ = require('lodash');
var logger = null;
var unakul = null;

if (process.env.DEBUG) {
  console.log('Unakul will be debugging this session');
  logger = new Logger(levels.DEBUG);
} else {
  logger = new Logger(levels.ERROR);
}

var actions = {
  say: function(sessionId, context, message, cb) {
    console.log('Pin: ' + message);
    if (unakul.callback) {
      unakul.callback(null, sessionId, message);
    }
    cb();
  },
  merge: function(sessionId, context, entities, message, cb) {
    cb(context);
  },
  error: function(sessionId, context, error) {
    debugger;
    console.log('wit error: ',error.message);
  },

  getSuggestions: function(sessionId, context, cb) {
    debugger;
    context.aSuggestion = 'After You.'
    cb(context)
  },
  getGreeting: function(sessionId, context, cb) {
    debugger;
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
unakul = {
  receiveMessage: function(msg, sessionId) {
    console.log('receivedMessage: ');
    if (typeof context === 'undefined' || context === null) context = {};
    client.runActions(sessionId, msg, context, (error, data) => {
      if (error) {
        console.log('Oops! Got an error: ' + error);
      } else {
        console.log('Yay, got Wit.ai response: ' + JSON.stringify(data));
      } 
      // if (callback) callback(error, data);
    });
  },
  client: client,
  callback: null
};



module.exports = unakul; 