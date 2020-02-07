const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User.model');
const bcryptjs = require('bcryptjs');

module.exports = passport => {
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then(user => {
        done(null, user);
      })
      .catch(error => {
        done(error);
      });
  });

  passport.use(
    new LocalStrategy(
      {
        passReqToCallback: true,
      },
      (email, password, done) => {
        User.findOne({ email })
          .then(user => {
            if (!user) {
              return done(null, false, {
                message: 'This email is not registered!',
              });
            }

            //match password
            //1.
            // bcryptjs
            //   .compare(password, user.passwordHashed)
            //   .then(userMatch => {
            //     console.log('userMatch: ', userMatch);
            //     return done(null, user);
            //   })
            //   .catch(err => done(err));
            //2.
            bcryptjs.compare(password, user.passwordHashed, (err, isMatch) => {
              if (err) throw err;
              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, { message: 'Incorrect password' });
              }
            });
          })
          .catch(error => console.log(error));
      }
    )
  );
};
