
var bcrypt = require('bcrypt');

module.exports = {
  schema: true,
  attributes: {
    userid: {
      type: 'string',
      required: true
    },
    email: {
      type: 'email',
      required: true
    },
    wallet: {
      type: 'json',
      required: 'true'
    },
    encryptedPassword: {
      type: 'string'
    },
    qq: {
      type: 'string'
    },
    name: {
      type: 'string'
    },
    phone: {
      type: 'string'
    },
    role: {
      type: 'string'//^PREDATOR$|^JUNIOR$|^SOPHOMORE$|^FRESHMAN$/
    },
    toJSON: function () {
      var obj = this.toObject();
      delete obj.encryptedPassword;
      return obj;
    }
  },

  beforeCreate: function (values, next) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(values.password, salt, function (err, hash) {
        if (err) return next(err);
        values.encryptedPassword = hash;
        next();
      })
    })
  },

  comparePassword: function (password, user, cb) {
    bcrypt.compare(password, user.encryptedPassword, function (err, match) {

      if (err) cb(err);
      if (match) {
        cb(null, true);
      } else {
        cb(err);
      }
    })
  }
};


