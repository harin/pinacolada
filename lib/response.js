var _ = require('lodash');

module.exports = {
  'IDLE': function () {
    return _.sample([
      'How can I help you today?'
    ])
  },
  'WAIT_LOCATION': function() {
    return _.sample([
      "Let me know where you are so I can suggest a restaurant near you.",
      "Where are you now? Send me your location and I'll find a restaurant near you."
    ])
  },
  'WAIT_LOCATION_REPEAT': function() {
    return "I'm waiting for your location :(";
  },
  'SUGGEST_LOOKUP': function () {
    return _.sample([
      'Looking up a place for you, please wait one moment.',
      'How about...'
      ]);
  },
  'SUGGEST': function (rest, i) {
    var url = "http://www.wongnai.com/" + rest.url;
    var dispName = rest.displayName;
    var dispPrice = rest.priceRange.name;

    // var dis = '';
    // dis += "Why don't you eat at " + dispName + ' it is priced at ';
    // dis +=  dispPrice + '. Here is some more detail if you need it ' + url;
    return {
       name: dispName,
       price: dispPrice,
       url: url
    }
    return dis;
  },
  'UNSATISFIED_SUGGEST': function () {
    return 'Why not T^T?? you want more options based on price/location/cuisine??'
  },
  'SATISFIED_SUGGEST': function () {
    return _.sample([
      'Yes AGREEEE!',
    ])
  },
  'FEEDBACK': function () {
    return 'Do you like the restaurant I suggested?';
  },
  'SATISFIED_FEEDBACK': function () {
    return "I'm am glad you liked it!"
  },
  'UNSATISFIED_FEEDBACK': function () {
    return "I'm sorry you didn't like our suggestion :("
  },
  'DONT_UNDERSTAND': function () {
    return "Sorry, I don't understand.";
  },
  'SUGGEST_LIMIT': function() {
    return "You're TOO hard to please! I'M DONE!";
  }
}