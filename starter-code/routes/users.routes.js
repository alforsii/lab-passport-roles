const router = require('express').Router();
// Require user model
const User = require('../models/User.model');
// Add bcrypt to encrypt passwords
const bcryptjs = require('bcryptjs');
const saltRound = 10;
let userProfile;
// Add passport
const passport = require('passport');
// const ensureLogin = require('connect-ensure-login');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

//1.Signup
router.get('/signup', (req, res) => {
  res.render('users/signup');
});

//2. Signup page
router.post('/signup', (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.render('users/signup', {
      err: 'Please provide username, email and password!',
    });
    console.log('no user,email,password');
    return;
  }

  User.findOne({ email }).then(user => {
    if (user !== null) {
      res.render('users/signup', { err: 'Username already registered!' });
      console.log('email registered');
      return;
    }
    bcryptjs
      .genSalt(saltRound)
      .then(salt => bcryptjs.hash(password, salt))
      .then(hashedPassword => {
        return User.create({
          username,
          email,
          passwordHashed: hashedPassword,
        })
          .then(() =>
            res.render('users/signup', {
              message: 'Thank you successfully registered. Now you can login!',
            })
          )
          .catch(err => {
            res.render('users/signup', { message: 'Something went wrong!' });
            console.log(err);
          });
      })
      .catch(err => {
        console.log('error last catch');
        next(err);
      });
  });
});

//3.login
router.get('/login', (req, res) => {
  res.render('users/login', { message: req.flash('error') });
});

// router.post(`/login`, (req, res, next) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     res.render('users/login', {
//       err: 'Please provide your Email and password!',
//     });
//     return;
//   }
//   User.findOne({ email })
//     .then(foundEmail => {
//       if (!foundEmail) {
//         res.render('users/login', {
//           err: 'This email is not registered',
//         });
//         return;
//       }
//       if (bcryptjs.compareSync(password, passwordHashed)) {
//         res.redirect('/users/user-profile', { user: req.user });
//       } else {
//         res.render('users/login', {
//           err: 'Incorrect password!',
//         });
//         return;
//       }
//     })
//     .catch(err => console.log(err));
// });

//4. Login page
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/users/user-profile',
    failureRedirect: '/users/login',
    failureFlash: true,
    passReqToCallback: true,
  })(req, res, next);
});

//6.logout
router.get('/logout', (req, res) => {
  req.logout();
  res.render('users/login', {
    message: 'Thank you! You successfully signed out!',
  });
});

//users page
router.get(`/user-profile`, (req, res, next) => {
  res.render('users/user-profile');
});
//
router.get('/private-page', (req, res) => {
  res.render('manager/boss');
});

module.exports = router;
