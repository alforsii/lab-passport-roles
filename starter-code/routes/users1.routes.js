const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
// Require user model
const User = require('../models/User.model');
// Add bcrypt to encrypt passwords
const bcryptjs = require('bcryptjs');
// Add passport
const passport = require('passport');
const ensureLogin = require('connect-ensure-login');

//1. Render signup form
router.get('/signup', checkNotAuth, (req, res) => {
  res.render('users/signup');
});
//2. add user form to DB
router.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  //check form if all inputs are filled by user
  if (!username || !email || !password) {
    return res.render('users/signup', {
      err: 'Please fill up all fields',
    });
  }

  //password condition
  //   const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  //   if (!regex.test(password)) {
  //     res
  //       .status(500)
  //       .render('auth/signup', { errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.' });
  //     return;
  //   }
  //check if User isn't registered already
  User.findOne({ email })
    .then(currentUser => {
      console.log('Output for: currentUser', currentUser);
      if (currentUser !== null) {
        return res.render('users/signup', {
          err: 'The username already exists!',
        });
      }
      const salt = bcryptjs.genSaltSync(10);
      const hashPassword = bcryptjs.hashSync(password, salt);
      console.log('Output for: hashPassword', hashPassword);
      return User.create({
        username,
        email,
        passwordHashed: hashPassword,
      })
        .then(newUser => {
          console.log(`New user created: ${newUser}`);
          res.render('users/signup', {
            message: 'Thank you successfully registered. Now you can login!',
          });
        })
        .catch(error => {
          if (error instanceof mongoose.Error.ValidationError) {
            res.status(500).render('users/signup', { err: error.message });
          } else if (error.code === 11000) {
            res.status(500).render('users/signup', {
              err:
                'Username and email need to be unique. Either username or email is already used.',
            });
          } else {
            next(error);
          }
        });
    })
    .catch(error => {
      console.log('error', error);
    });
});

//3. Render login page
router.get('/login', checkNotAuth, (req, res) => {
  //   console.log('Output for: req', req.session);
  res.render('users/login', { message: req.flash('error') });
});

//4. login page
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/users/user-profile',
    failureRedirect: '/users/login',
    failureFlash: true,
    passReqToCallback: true,
  })(req, res, next);
});

//users page
router.get(`/user-profile`, checkAuth, (req, res, next) => {
  res.render('users/user-profile');
});
//
router.get('/private-page', checkAuth, (req, res) => {
  res.render('manager/boss', { user: req.user });
});

//6.logout
router.get('/logout', (req, res) => {
  req.logout();
  res.render('users/login', {
    message: 'Thank you! You successfully signed out!',
  });
});

//some cool functions, which checks if signed in will not allow
//you to go /login or /signup pages or other way,
// if sign out will not allow you to go /private-page
//----- or ensureLogin.ensureLoggedIn('/login') -------
// the same as below
function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/users/login');
}

function checkNotAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/users/user-profile');
  }
  next();
}

module.exports = router;
