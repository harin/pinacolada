wongnai = require('./lib/wongnai');

wongnai({
  price: [100, 300]
}).then(function(data, q) {
  console.log(data);
}, function(err) { 
  console.log(err);
});