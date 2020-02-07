require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const session = require('express-session');
const bcryptjs = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const User = require('./models/User.model');

const app = express();

//DB config
require('./config/db.config');
const app_name = require('./package.json').name;
const debug = require('debug')(
  `${app_name}:${path.basename(__filename).split('.')[0]}`
);

// Middleware Setup
app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());
app.use(
  session({
    secret: 'passport-roles-app',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// require('./config/passport.config')(passport);
//Passport config
passport.serializeUser((user, next) => {
  next(null, user._id);
});

passport.deserializeUser((id, next) => {
  User.findById(id)
    .then(user => {
      next(null, user);
    })
    .catch(error => {
      next(error);
    });
});

passport.use(
  new LocalStrategy(
    {
      passReqToCallback: true,
    },
    (req, email, password, next) => {
      User.findOne({ email })
        .then(user => {
          if (!user) {
            return next(null, false, { message: 'Incorrect email' });
          }
          if (!bcryptjs.compareSync(password, user.passwordHashed)) {
            return next(null, false, { message: 'Incorrect password' });
          }
          next(null, user);
        })
        .catch(error => {
          next(error);
        });
    }
  )
);

// Express View engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// default value for title local
app.locals.title = 'Passport - User roles';

const index = require('./routes/index');
app.use('/', index);
// app.use('/users', require('./routes/users.routes'));
app.use('/users', require('./routes/users1.routes'));

module.exports = app;
