var TOKEN = 'SAKVI5YAUYYAGZJ5ITPFP2KNGM4EHJHL'; // pinacolada

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
    console.log('wit error: ',error.message);
  },
};
var client = new Wit(TOKEN, actions, logger);

module.exports = client;
// client.message(process.argv[2], context, (error, data) => {
//   if (error) {
//     console.log('Oops! Got an error: ' + error);
//   } else {
//     console.log('Yay, got Wit.ai response: ' + JSON.stringify(data));
//   }
// });