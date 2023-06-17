var User = require('../models/user');
var Admin = require('../models/admin');

module.exports = {
  isUserOrAdminLoggedIn: (req, res, next) => {
    if (req.session && ((req.session.userId && req.session.userRole) || req.session.adminId) ){
      return next();
    } else {
      req.flash('error', 'Unauthorized access');
      req.session.returnsTo = req.originalUrl;
      return res.redirect('/users/login');
    }
  },
  isAdmin: (req, res, next) => {
    if (req.session && req.session.adminId) {
      return next();
    } else {
      req.flash('warn', 'Unauthorized Access');
      return res.redirect('/admins/adminlogin');
    }
  },
  userInfo: (req, res, next) => {
    let userId = req.session && req.session.userId;
    if (userId) {
      User.findById(userId, 'username email').then((user) => {
        req.user = user;
        res.locals.user = user;
        next();
      });
    } else {
      req.user = null;
      res.locals.user = null;
      next();
    }
  },
  adminInfo: (req, res, next) => {
    let adminId = req.session && req.session.adminId;
    if (adminId) {
      Admin.findById(adminId, 'username email').then((admin) => {
        req.admin = admin;
        res.locals.admin = admin;
        next();
      });
    } else {
      res.admin = null;
      res.locals.admin = null;
      next();
    }
  },
};
