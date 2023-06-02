var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Category = require('../models/category');
var auth = require('../middlewares/auth');

// to list all the categorys
router.get('/', auth.isAdmin, (req, res, next) => {
  Category.find({})
    .then((categories) => {
    //   console.log(categories);
      res.render('category', { categories: categories });
    })
    .catch((err) => {
      console.log(err);
    });
});

// to add a new category
router.get('/new',auth.isAdmin, (req, res) => {
  res.render('addCategory');
});

// Adding a new category
router.post('/', (req, res, next) => {
  Category.create(req.body)
    .then((category) => {
      res.redirect('/categories');
    })
    .catch((err) => {
      console.log(err);
      if (err) return next(err);
    });
});

module.exports = router;
