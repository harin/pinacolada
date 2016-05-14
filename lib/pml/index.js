var _ = require('lodash');
var enm = require('../wongnai/enum.js');
var config = require('../../config.js');
var sigm = function(x) {
  return 1 / (1 + Math.exp(-x * config.SIGM_CONSTANT))
}

var learnRec = function(k, w, alpha) {
  alpha = alpha || 1;
  if(_.isArray(k)) {
    _.forEach(k, function(e) {
      w[e] = (w[e] || 0) + alpha*config.LONG_LEARNING_RATE;
    })
  } else if(!_.isNil(k)){
    w[k] = (w[k] || 0) + alpha*config.LONG_LEARNING_RATE;
  }
};
var learnRestaurant = function(restaurant, user) {
  var categories = _.map(restaurant.categories, function(e) {
    return e.id;
  });
  var params = {};
  params.nationality = enm.nationality(categories);
  params.business = enm.business(categories);
  params.food = enm.food(categories);
  params.price = [restaurant.priceRange.value];
  _.forOwn(params, function(v,k) {
    if(!_.has(user.w, k)) {
      user.w[k] = {};
    }
    learnRec(params[k], user.w[k]);
  });
  return user;
};
var learnInput = function(input, user, alpha) {
  alpha = alpha || 1;
  var params = {};

  //modify input
  params.nationality = enm.nationality(input.nationality);
  params.food = enm.food(input.food);
  params.business = enm.business(input.business);
  params.price = enm.price(input.price);

  _.forOwn(params, function(v,k) {
    if(_.isArray(v)) {
      user.w[k] = user.w[k] || {};
      learnRec(v, user.w[k], alpha);
    }
  });
  console.log(user);
  return user;
};
var output = function(user) {
  var decision = {};
  _.forOwn(user.w, function(v,k) {
    if(_.isPlainObject(v)) {
      decision[k] = [];
      _.forOwn(v, function(v2,k2) {
        if(Math.random() < sigm(v2)) {
          decision[k].push(_.toInteger(k2));
        }
      });

      //special for price
      if(k == 'price') {
        decision[k] = _.map(decision[k], function(e) {
          if(e == 5) {
            return 1001;
          } else {
            return (e - 1) * 250;
          }
        });
      }
    }
  });
  return _.omitBy(decision, _.isEmpty);
};

module.exports = {
  learnRestaurant: learnRestaurant,
  learnInput: learnInput,
  output: output
}