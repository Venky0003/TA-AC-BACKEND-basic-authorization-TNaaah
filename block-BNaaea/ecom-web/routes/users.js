var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Product = require('../models/product');

function requireLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    return next(err);
  }
}

/* GET users listing. */
router.get('/', function (req, res, next) {
  console.log(req.session);
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
  User.findOne({ email })
    .then((user) => {
      // console.log(user);
      // no user
      if (!user) {
        req.flash('error', 'This Email is not Registered');
        return res.redirect('/users/login');
      }
      if (user.blocked) {
        res.render('login', {
          error: 'Your account is blocked. Please contact the administrator.',
        });
        return;
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
        res.redirect('/products');
      });
    })
    .catch((error) => {
      console.log(error);
    });
});



// Add product to cart
router.get('/products/:id/cart', requireLogin, (req, res, next) => {
  const productId = req.params.id;
  const userId = req.session.userId;

  Product.findById(productId)
    .then((product) => {
      if (!product) {
        return res.status(404).send('Product not found.');
      }

      User.findByIdAndUpdate(
        userId,
        { $push: { cart: productId } },
        { new: true }
      )
        .then((user) => {
          if (!user) {
            return res.status(404).send('User not found.');
          }

          // Redirect the user to the cart page
          res.redirect('/users/cart');
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
});

// View cart
router.get('/cart', requireLogin, (req, res, next) => {
  const userId = req.session.userId;

  User.findById(userId)
    .populate('cart')
    .then((user) => {
      // console.log(user)
      res.render('cart', { cartItems: user.cart });
    })
    .catch((error) => {
      console.log(error);
    });
});

// to remove products from the cart
router.get('/cart/remove/:id', requireLogin, (req, res, next) => {
  const productId = req.params.id;
  const userId = req.session.userId;

  User.findByIdAndUpdate(userId, { $pull: { cart: productId } }, { new: true })
    .populate('cart')
    .then((user) => {
      res.render('cart', { cartItems: user.cart });
    })
    .catch((error) => {
      console.log(error);
    });
});
// -------------------

router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/users/login');
});

module.exports = router;
