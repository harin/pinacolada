var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  mid: String,
  w: Schema.Types.Mixed,
  history: Schema.Types.Mixed
});

var User = mongoose.model('User', userSchema);
module.exports = User;


// mongodb://<dbuser>:<dbpassword>@ds023042.mlab.com:23042/heroku_zdfljbxs
// { user: "heroku_zdfljbxs", account: "heroku_zdfljbxs" }