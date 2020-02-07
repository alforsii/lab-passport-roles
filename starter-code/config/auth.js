module.exports = {
  //1. This goes for /private-page to ensure if user (isAuthenticated) signed in, if yes next go ahead, else /login
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  },
  //2. This goes for /login or /register to ensure if user (isAuthenticated) already signed in , if yes then don't go to /login or /register, else go ahead /login or /register
  forwardAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/private-page');
    }
    next();
  },
};
