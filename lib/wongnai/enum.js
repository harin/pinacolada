var _ = require('lodash');

var nationality = {
  northern: 44,
  others: 37,
  italian: 5,
  american: 8,
  southern: 49,
  mexican: 41,
  muslim: 40,
  korean: 6,
  isan: 34,
  chinese: 4,
  vietnam: 7,
  indian: 10,
  fusion: 13,
  french: 9,
  japanese: 2,
  international: 33,
  thai: 3 
};

var food = {
  'ice cream': 25,
  'dessert': 23,
  'moo kata': 51,
  'steak': 35,
  'barbeque': 43,
  'fastfood': 28,
  'seafood': 29,
  'quick meal': 36,
  'vegetarian': 27,
  'buffer': 11,
  'pizza': 42,
  'ramen': 50,
  'healthy':39,
  'sukiyaki': 20, //shabu
  'sushi': 45,
  'noodles': 30,
  'bakery cake': 24,
  'breakfast': 19,
  'beverage': 21 //juice, drink
};

var business = {
  'street food': 12,
  'delivery': 31,
  'bar': 15,
  'karaoke': 18,
  'wine bar': 22,
  'franchise': 38, //chain
  'no storefront': 52, //delivery only
  'food truck': 54,
  'rooftop': 53,
  'hotel': 26, //lounge
  'pub': 16, //clubs
  'riverside': 32,
  'music venues': 17,
  'cafe': 14
};
var alcohol = {
  wine: 1,
  beer: 2,
  cocktail: 3,
  liquor: 4
};
var parking = {
  'no parking': 0,
  'street': 1,
  'valet': 2,
  'parking lot': 3
};
var sort = {
  'best match': 6,
  'wongnai score': 1,
  'highest rate': 2,
  'most reviewed': 3,
  'recently reviewed': 4,
  'most viewed': 5
};
var campaign = {
  'wongnai': 1,
  'ais': 2,
  'kbank': 3,
  'mekhong': 4
};
var price = function(arr) {
  var set = [];
  var min = _.min(arr);
  var max = _.max(arr);

  if(min <= 100) {
    set.push(1);
  }
  if(min <= 250) {
    set.push(2);
  } 
  if(min <= 500) {
    set.push(3);
  }
  if(min <= 1000) {
    set.push(4);
  }
  set.push(5);

  //max
  if(max <=100) {
    _.pullAll(set, [2,3,4,5]);
  }
  if(max <=250) {
    _.pullAll(set, [3,4,5]);
  }
  if(max <=500) {
    _.pullAll(set, [4,5]);
  }
  if(max <=1000) {
    _.pullAll(set, [5]);
  }

  return set;
};
var mapKFn = function(map) {
  return function(arr) {
    var result = [];
    _.forOwn(_.pick(map, arr), function(v,k) {
      result.push(v);
    });
    return _.uniq(result);
  };
};
var mapFn = function(map) {
  return function(arr) {
    if(_.isEmpty(arr)) {
      return [];
    }
    var result = [];
    _.forOwn(_.pickBy(map, function(v,k) {
      return _.findIndex(arr, function(e2) {
        return e2 == v || e2 == k;
      }) >= 0;
    }), function(v,k) {
      result.push(v)  ;
    });
    return _.uniq(result);
  };
};
module.exports = {
  raw: {
    nationality: nationality,
    food: food,
    business: business,
    alcohol: alcohol,
    parking: parking,
    sort: sort,
    price: price,
    campaign: campaign,
    mapFn: mapFn,
    imapFn: mapKFn
  },
  nationality: mapFn(nationality),
  food: mapFn(food),
  business: mapFn(business),
  alcohol: mapFn(alcohol),
  parking: mapFn(parking),
  sort: mapFn(sort),
  price: price,
  campaign: mapFn(campaign)
};