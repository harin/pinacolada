var unirest = require('unirest');
var Promise = require('bluebird');
var wongnaiEnum = require('./enum.js');
var _ = require('lodash');

var url = "https://www.wongnai.com/restaurants.json";
var cat = "https://www.wongnai.com/categories.json";

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
    //build categories
    var params = { features: {} };
    params.categories = _.concat(wongnaiEnum.food(input.food), wongnaiEnum.nationality(input.nationality), wongnaiEnum.business(input.business));
    params.features.servedAlcohol = wongnaiEnum.alcohol(input.alcohol);
    params.features.parkings = wongnaiEnum.parking(input.parking);
    params.sort.type = input.sort;
    params.features.open = input.open;
    params.features.discount = input.discount;

    //get with params
    unirest.get(url)
    .headers({
      'Content-Type': 'application/json'
    })
    .encoding('utf-8')
    .query({
      spatialInfo: {
        coordinate: {
          latitude: input.longitude
          longitude: input.latitude
        },
        radius: input.radius
      },

    })
    .end(function(response) {
      if(response.statusType < 3) {
        //successfully loaded
        var html = response.body;
        var data = response.data.page.entities;

        resolve(data);
      } else {
        //fail
        reject(null);
      }
    });
  });

  return wongnaiPromise;
}

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
}

module.exports = query;