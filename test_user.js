require('./lib/db.js')
var User = require('./models/user.js');


User.find({}, function (err, users) {
  console.log(users);
});