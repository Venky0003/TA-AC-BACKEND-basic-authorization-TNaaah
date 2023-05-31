var express = require('express');
var router = express.Router();
var User = require('../models/user');

/* GET users listing. */
router.get('/', function (req, res, next) {
  // console.log(req.session);
  res.render('users');
});

router.get('/register', (req, res, next) => {
  res.render('register', { error: req.flash('error')[0] });
});

router.post('/register', (req, res, next) => {
  User.create(req.body)
    .then((user) => {
      res.redirect('/users/login');
    })
    .catch((err) => {
      if (
        err.code === 11000 &&
        err.keyPattern &&
        err.keyValue &&
        err.keyValue.email
      ) {
        req.flash('error', 'This Email is taken');
        return res.redirect('/users/register');
      } else if (err.name === 'ValidationError') {
        let error = err.message;
        req.flash('error', error);
        return res.redirect('/users/register');
      }
      return res.json({ err });
    });
});

//login form
router.get('/login', (req, res, next) => {
  res.render('login', { error: req.flash('error')[0] });
});

// login handler
router.post('/login', (req, res, next) => {
  var { email, password } = req.body;
  // console.log(email, password);
  if (!email || !password) {
    req.flash('error', 'Email/Password required');
    return res.redirect('/users/login');
  }
  User.findOne({ email }).then((user) => {
    // console.log(user);
    // // no user
    if (!user) {
      req.flash('error', 'This Email is not Registered');
      return res.redirect('/users/login');
    }
    // user compare password
    user.verifyPassword(password, (err, result) => {
      // console.log(result)
      if (err) return next(err);
      if (!result) {
        req.flash('error', 'Incorrect Password');
        return res.redirect('/users/login');
      }
      // persist the logged in user info
      req.session.userId = user.id;
      res.redirect('/articles');
    });
  });
});

router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/users/login');
});

module.exports = router;
