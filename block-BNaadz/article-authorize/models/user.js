var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    // name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, minlength: 8, required: true },
    city: { type: String, required: true },
  },
  { timestamps: true }
);
userSchema.methods.getFullName = function () {
  return this.firstName + ' ' + this.lastName;
};

userSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    bcrypt.hash(this.password, 10, (err, hashed) => {
      if (err) return next(err);
      this.password = hashed;
      return next();
    });
  } else {
    next();
  }
});

userSchema.methods.verifyPassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, result) => {
    return cb(err, result);
  });
};

module.exports = mongoose.model('User', userSchema);
