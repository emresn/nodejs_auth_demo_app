const localStrategy = require("passport-local").Strategy;
const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");

passport.use(
  new localStrategy((username, password, done) => {
    User.findOne({ username }, (err, user) => {
      if (err) return done(err, null, "Bir Hata oluştu");
      if (!user) return done(null, false, "User not found.");
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          return done(null, user, "Successfully logged in.");
        } else {
          return done(null, false, "Incorrect password.");
        }
      });
    });
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
