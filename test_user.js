require('./lib/db.js')
var User = require('./models/user.js');


User.find({}, function (err, users) {
  console.log(users);
});


var u = new User({
  mid: '111',
  w: {hello: 'world'},
  history: ['1','2','3']
}).save(function(err){
  if(err) console.log(err);
  process.exit(0);
});