//require('./lib/db.js')
var wongnai = require('./lib/wongnai');
var pml = require('./lib/pml')
//var User = require('./models/user.js');

var user = { w: {}};

wongnai({
  nationality: ['japanese'],
  price: [250]
}).then(function(data) {
  //learn from input
  /*
  pml.learnInput({
    nationality: ['japanese', 'italian']
  }, user, +3); //positive


  pml.learnInput({
    nationality: ['indian']
  }, user, -3); //negative*/
  
  //learn from visited restaurant training
  pml.learnRestaurant(data[0], user);
  pml.learnRestaurant(data[1], user);
  pml.learnRestaurant(data[2], user);
  console.log(user.w);
  console.log(pml.output(user));
})

/*
User.find({}, function (err, users) {
  console.log(users);
});
*/