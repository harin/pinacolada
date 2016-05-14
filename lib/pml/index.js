var _ = require('lodash');
var enum = require('../wongnai/enum.js');
var config = require('../../config.js');
var sigm = function(x) {
  return 1 / 1 + Math.exp(-x * config.SIGM_CONSTANT)
}

var learnRec = function(k, w, alpha) {
  if(_.isArray(k)) {
    _.forEach(k, function(e)) {
      w[e] = (w[e] || 0) + alpha*config.LONG_LEARNING_RATE;
    }
  } else if(!_.isNil(k)){
    w[k] = (w[k] || 0) + alpha*config.LONG_LEARNING_RATE;
  }
};
var learnRestaurant = function(restaurant, user) {
  var categories = _.map(restaurant.categories, function(e) {
    return e.id;
  });
  var params = {};
  params.nationality = enum.nationality(categories);
  params.business = enum.business(categories);
  params.food = enum.food(categories);
  params.price = [restaurant.priceRanges.value];

  _.forOwn(params, function(v,k) {
    learnRec(params.nationality, user.w.nationality);
    learnRec(params.business, user.w.business);
    learnRec(params.food, user.w.food);
    learnRec(params.price, user.w.price);
  });

  return user;
};
var learnInput = function(input, user, negate) {
  negate = negate || false;
  _.forOwn(input, function(v,k) {
    if(_.isArray(v)) {
      if(k == 'price') {
        learnRec(enum.price(v), user.w[k], negate ? -1 : 1);
      } else {
        learnRec(v, user.w[k], negate ? -1: 1);
      }
    }
  });
};
var output = function(user) {

};