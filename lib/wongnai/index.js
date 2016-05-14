var unirest = require('unirest');
var Promise = require('bluebird');
var enm = require('./enum.js');
var _ = require('lodash');

var url = "https://www.wongnai.com/restaurants.json";
//var cat = "https://www.wongnai.com/categories.json";

var features = {
    priceRanges: [],
    servedAlcohols: [],
    parkings: [],
    creditCardAccepted: false,
    goodForGroups: false,
    goodForKids: false,
    bookable: false,
    voucher: false,
    discount: false,
    open: false
  }

/**
 * Get wongnai list of restaurant
 *
 * @param      {Object}   input  see input-schema.json
 * @return     {Promise}  bluebird promise
 */
var query = function(input) {
  //wongnai
  var wongnaiPromise = new Promise(function(resolve, reject) {
    input = input || {};
    //build params
    var params = {};

    params['categories'] = _.concat(enm.food(input.food), enm.nationality(input.nationality), enm.business(input.business));
    params['page'] = input.page;
    params['campaign'] = enm.campaign(input.campaign);
    params['features.servedAlcohol'] = enm.alcohol(input.alcohol);
    params['features.priceRanges'] = enm.price(input.price);
    params['features.parkings'] = enm.parking(input.parking);
    params['sort.type'] = input.sort;
    params['features.open'] = input.open;
    params['features.discount'] = input.discount;
    params['spatialInfo.radius'] = input.radius;
    params['spatialInfo.coordinate.latitude'] = input.latitude;
    params['spatialInfo.coordinate.longitude'] = input.longitude;
    params['q'] = input.q;

    //omit
    params = _.omitBy(params, _.isEmpty);

    //get with params
    unirest.get(url)
    .headers({
      'Content-Type': 'application/json'
    })
    .encoding('utf-8')
    .query(params)
    .end(function(response) {
      if(response.statusType < 3) {
        //successfully loaded
        var data = response.body.page.entities;

        resolve(data);
        //resolve(response.body.query);
      } else {
        //fail
        reject(response.body);
      }
    });
  });

  return wongnaiPromise;
}
/*
var category = function() {
  //category
  var categoryPromise = new Promise(function(resolve, reject) {
    unirest.get(cat)
    .headers({
      'Content-Type': 'application/json'
    })
    .encoding('utf-8')
    .end(function(response) {
      if(response.statusType < 3) {
        resolve(response.categories);
      }
      else {
        reject(null);
      }
    })
  });
  return categoryPromise;
}*/

module.exports = query;