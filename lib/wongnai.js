var defaults = require('defaults');
var unirest = require('unirest');
var Promise = require('bluebird');
var cheerio = require('cheerio');

var url = "https://www.wongnai.com/businesses";

/**
 * Get wongnai data with latitude and longitude
 *
 * @param      {Number|String}   lat     latitude
 * @param      {Number|String}   lon     longitude
 * @param      {Object}   opt     options
 * @return     {Promise}  bluebird promise
 */
module.exports = function(lat, lon, opt) {
  //some ext options
  var options = defaults(opt, {

  });

  //Query wongnai
  var promise = new Promise(function(resolve, reject) {
    //get with params
    unirest.get(url)
    .headers({
      'Content-Type': 'text/html'
    })
    .encoding('utf-8')
    .query({
      'spatialInfo.coordinate.latitude': lat,
      'spatialInfo.coordinate.longtitude': lon,
      'domain': 1
    })
    .end(function(response) {
      if(response.statusType < 3) {
        //successfully loaded
        var html = response.body;

        //get scoped jquery
        var $ = cheerio.load(response.body);
        var list = [];

        //Get each result li
        $('.businesses-result .wui-page .wui-result ul > li').each(function() {

          //Get title name's dom
          var nameObj = $('.name', this).clone().children().remove().end();

          //Get name text and href link
          var name = nameObj.text().trim();
          var link = nameObj.attr('href').trim();

          //Save to list
          list.push({
            name: name,
            link: link
          });
        });

        resolve(list);


      } else {
        //fail
        reject(null);
      }
    });
  });
  return promise;
}
