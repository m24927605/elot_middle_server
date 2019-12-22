var sails = require('sails');

before(function(done) {
  sails.lift({}, function(err) {
    if (err) return done(err);
    done(err, sails);
  });
});
