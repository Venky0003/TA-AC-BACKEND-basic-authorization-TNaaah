var express = require('express');
var router = express.Router();
var Admin = require('../models/admin');
var User = require('../models/user');
var auth = require('../middlewares/auth');

/* GET users listing. */
router.get('/dashboard', function (req, res, next) {
  // console.log(req.session);
  res.render('dashboard');
});

router.get('/adminregister', (req, res, next) => {
  res.render('adminRegister', { error: req.flash('error')[0] });
});

router.post('/adminregister', (req, res, next) => {
  Admin.create(req.body)
    .then((admin) => {
      res.redirect('/admins/adminlogin');
    })
    .catch((err) => {
      if (
        err.code === 11000 &&
        err.keyPattern &&
        err.keyValue &&
        err.keyValue.email
      ) {
        req.flash('error', 'This Email is taken');
        return res.redirect('/admins/adminregister');
      } else if (err.name === 'ValidationError') {
        let error = err.message;
        req.flash('error', error);
        return res.redirect('/admins/adminregister');
      }
      return res.json({ err });
    });
});

//login form
router.get('/adminlogin', (req, res, next) => {
  res.render('adminLogin', { error: req.flash('error')[0] });
});

// login handler
router.post('/adminlogin', (req, res, next) => {
  var { email, password } = req.body;
  // console.log(email, password);
  if (!email || !password) {
    req.flash('error', 'Email/Password required');
    return res.redirect('/admins/adminlogin');
  }
  Admin.findOne({ email }).then((admin) => {
    // console.log(user);
    // // no user
    if (!admin) {
      req.flash('error', 'This Email is not Registered');
      return res.redirect('/admins/login');
    }
    // user compare password
    admin.verifyPassword(password, (err, result) => {
      // console.log(result)
      if (err) return next(err);
      if (!result) {
        req.flash('error', 'Incorrect Password');
        return res.redirect('/admins/adminlogin');
      }
      // persist the logged in user info
      req.session.adminId = admin.id;
      res.redirect('/podcasts');
    });
  });
});

router.get('/adminlogout', (req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/admins/adminlogin');
});

module.exports = router;
