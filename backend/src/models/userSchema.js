const mongoose = require('mongoose');
const md5 = require("md5");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required']
  },
  salt: {
    type: String,
    required: [true, 'Salt is required']
  },
  hash: {
    type: String,
    required: [true, 'Hash is required']
  }
  // created: {
  //   type: Date,
  //   required: [true, 'Created date is required']
  // }
});

userSchema.statics.getHash = function (password, salt) {
  return md5(salt + password);
};
// instance function:
// userSchema.methods.getHash = function (password) {
//   return md5(this.salt + password);
// };

module.exports = userSchema;
