//require('./lib/db.js')
var wongnai = require('./lib/wongnai');
var pml = require('./lib/pml')
//var User = require('./models/user.js');

var user = { w: {}};

wongnai().then(function(data) {
  //learn from input
  pml.learnInput({
    nationality: ['japanese', 'italian']
  }, user); //positive
  pml.learnInput({
    nationality: ['indian']
  }, user, -1); //negative
  
  pml.learnRestaurant(data[0], user);
  pml.learnRestaurant(data[1], user);

  console.log(pml.output(user));
})

/*
User.find({}, function (err, users) {
  console.log(users);
});
*/