let express = require('express');
let router = express.Router();
let Product = require('../models/product');
var Category = require('../models/category');
var User = require('../models/user');
var multer = require('multer');
var path = require('path');
var uploadPath = path.join(__dirname, '../', 'public/uploads');
var auth = require('../middlewares/auth');


// router.use(express.static('public'));
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    console.log(file);
    // var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, Date.now() + '-' + file.originalname);
  },
});

var upload = multer({ storage: storage });

router.get('/', (req, res, next) => {
 
  Category.find({})
    .then((categories) => {
      Product.find({})
        .then((products) => {
          // console.log(products, categories)
          res.render('products', { products, categories });
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });

});

//for adding the new product
router.get('/new', auth.isAdmin, (req, res, next) => {
  Category.find({}).then((categories) => {
    res.render('addProduct', { categories });
  });
});

// for rendering the newly created products
router.post('/', upload.single('image'), auth.isAdmin, (req, res, next) => {
  // console.log(req.file, req.body);
  if (req.file && req.file.filename) {
    req.body.image = req.file && req.file.filename;
  }
  Product.create(req.body)
    .then((result) => {
      console.log(result);
      res.redirect('/products');
    })
    .catch((error) => {
      next(error);
    });
});

// to list the details of the single product
router.get('/:id', (req, res, next) => {
  var id = req.params.id;
  Product.findById(id)
    .populate('categories')
    .then((product) => {
      res.render('productDetails', { product });
    })
    .catch((error) => {
      console.log(error);
    });
  
});

// to edit the details of product
router.get('/:id/edit', auth.isAdmin, (req, res, next) => {
  var id = req.params.id;
  Product.findById(id)
    .populate('categories')
    .then((product) => {
      Category.find()
        .then((categories) => {
          res.render('editProduct', {
            product: product,
            categories: categories,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
});

// to post the the edited form updated
router.post('/:id', upload.single('image'), auth.isAdmin, (req, res, next) => {
  let id = req.params.id;

  Product.findById(id)
    .then((product) => {
      // Update the fields with new values
      product.productName = req.body.productName;
      product.quantity = req.body.quantity;
      product.price = req.body.price;
      product.likes = req.body.likes;

       // Check if a new image is uploaded
      if (req.file) {
        product.image = [req.file.filename];
      }

      // Save the updated product
      product
        .save()
        .then((result) => {
          res.redirect('/products/' + id);
        })
        .catch((error) => {
          if (error) return next(error);
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('An error occurred while finding the product.');
    });
});

// to delete the product
router.get('/:id/delete', auth.isAdmin, (req, res, next) => {
  let id = req.params.id;

  Product.findByIdAndDelete(id)
    .then(() => {
      res.redirect('/products');
    })
    .catch((error) => {
      if (error) return next(error);
    });
});

// for likes on the article
router.get('/:id/likes', (req, res, next) => {
  let id = req.params.id;
  Product.findByIdAndUpdate(id, { $inc: { likes: 1 } }).then(() => {
    res.redirect('/products/' + id);
  });
});

router.get('/category/:categoryId', (req, res, next) => {
  var categoryId = req.params.categoryId;

  // Find events by category ID
  Product.find({ categories: categoryId })
    .populate('categories')
    .then((products) => {
      res.render('productsByCategories', { products, categoryId });
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
});


module.exports = router;
