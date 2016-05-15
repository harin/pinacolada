//require('./lib/db.js')
var wongnai = require('./lib/wongnai');
var pml = require('./lib/pml')
//var User = require('./models/user.js');

var user = { w: {}};

wongnai({
  nationality: ['japanese'],
  price: [250]
}).then(function(data) {

  pml.learnTinder({
    1: ['japanese', 'fastfood'],
    3: ['american', 'indian', 'seafood']
  }, user)

 // console.log(user.w);
  
  //like
  pml.learnInput({
    nationality: ['japanese', 'italian'],
    food: ['fastfood', 'ice cream']
  }, user, 1);

  //love
  pml.learnInput({
    nationality: ['indian'],
    food: ['steak']
  }, user, 3);
  
  //learn from visited restaurant training
  pml.learnRestaurant(data[0], user);
  pml.learnRestaurant(data[1], user);
  pml.learnRestaurant(data[2], user);

  console.log(pml.output(user));
});

/*
User.find({mid: ...}, function (err, users) {
  console.log(users);
});
*/