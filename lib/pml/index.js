var _ = require('lodash');
var enm = require('../wongnai/enum.js');
var config = require('../../config.js');
var sigm = function(x) {
  return 1 / (1 + config.SIGM_ZERO_OFFSET*Math.exp(-x * config.SIGM_CONSTANT))
}

var learnRec = function(k, w, alpha, parse) {
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
  _.forOwn(decision, function(v, k) {
    if(k != 'price')
      decision[k] = enm.i[k](decision[k]);
    else {
      //do noth
    }
  })

  return _.omitBy(decision, _.isEmpty);
};

var parseTinder = function(ix) {
  var i = _.cloneDeep(ix);

  _.forOwn(i, function(v,k) {
    var v2 = {};
    v2.nationality = enm.i.nationality(v);
    v2.food = enm.i.food(v);
    i[k] = v2;
  });
  return i;
};

var learnTinder = function(input, user) {
  var parsed = parseTinder(input);
  _.forOwn(parsed, function(v,k) {
    var alpha = _.toNumber(k);
    learnInput(v, user, alpha);
  });
  return user;
}

module.exports = {
  learnRestaurant: learnRestaurant,
  learnInput: learnInput,
  learnTinder: learnTinder,
  parseTinder: parseTinder,
  output: output
}