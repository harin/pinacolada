//gettyimages
var unirest = require('unirest');
var Promise = require('bluebird');

var key = 'xyweh995yevpjjncd9mcmx5v';

module.exports = {
    getRandom: function (phrase) {
        var prom = new Promise(function (resolve, reject) {
            unirest.get('https://api.gettyimages.com/v3/search/images?phrase=' + phrase)
                .headers({
                    'Api-Key': key
                })
                .end(function (msg) {
                    if(msg.statusCode !== 200){
                        return reject(msg);
                    }
                    
                    resolve(msg.body);
                });
        });
        return prom;
    }
}