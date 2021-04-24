const mongoose = require('mongoose');
var userSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String,
    firstName: String,
    lastName: String,
    facebook: {
      id: String,
      token: String,
      name: String
    }
  });

  const FBUser = mongoose.model('User', userSchema);

module.exports = { FBUser }
