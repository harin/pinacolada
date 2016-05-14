wongnai = require('./lib/wongnai');

wongnai({
  food: ['ice cream', 'fastfood']
}).then(function(data, q) {
  console.log(data);
}, function(err) { 
  console.log(err);
});