let express = require('express');
let router = express.Router();
let Podcast = require('../models/podcast');
var auth = require('../middlewares/auth');
var multer = require('multer');
var path = require('path');
var uploadPath = path.join(__dirname, '../', 'public/uploads');
var User = require('../models/user');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

var upload = multer({ storage: storage });

router.get('/', auth.isUserOrAdminLoggedIn, (req, res, next) => {
  const userRole = req.session.userRole;
  // console.log('User Role:', userRole);
  // Fetch all podcasts, both user-added and admin-added
  if (userRole === 'admin') {
    Podcast.find({})
      .then((podcasts) => {
        console.log('Podcasts:', podcasts);
        console.log('user Role:', userRole);
        res.render('podcasts', { podcasts, userRole });
      })
      .catch((error) => {
        next(error);
      });
  } else {
    // Fetch user-added and admin-added  podcasts for non-admin users
    Podcast.find({})

      .then((podcasts) => {
        console.log('Podcasts:', podcasts);
        console.log('user Role:', userRole);
        res.render('podcasts', { podcasts, userRole });
      })
      .catch((error) => {
        next(error);
      });
  }
});


router.get('/new', auth.isUserOrAdminLoggedIn, (req, res, next) => {
  res.render('addPodcast');
});

router.post(
  '/',
  auth.isUserOrAdminLoggedIn,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
  ]),
  (req, res, next) => {
    const audioFiles = req.files['audio'];
    const imageFiles = req.files['image'];

    if (audioFiles && audioFiles.length > 0) {
      req.body.audio = audioFiles[0].filename;
    }

    if (imageFiles && imageFiles.length > 0) {
      req.body.image = imageFiles[0].filename;
    }
    if (req.session.adminId) {
      //if admins adds the content then it will have the roles selected by the admin
      req.body.userRole = req.body.userRole; 
    } else {
      // if user is adding the podcast then it will have the Free as default and if user changes also it will be free
      req.body.userRole = 'Free';
      req.body.verified = false;
    }
    Podcast.create(req.body)
      .then((result) => {
        console.log(result);
        res.redirect('/podcasts');
      })
      .catch((error) => {
        next(error);
      });
  }
);

// for render podacst details
router.get('/:id', auth.isUserOrAdminLoggedIn, (req, res, next) => {
  let id = req.params.id;
  let userRole = req.session.userRole;
  let admin = req.session.adminId;
  Podcast.findById(id)
    .then((podcast) => {
      // for admins all the podcasts
      if (admin) {
        res.render('podcastDetails', { podcast, userRole });
      } else if (podcast.userRole === 'Premium') {
        // allow access for users with Premium role only
        if (userRole === 'Premium') {
          res.render('podcastDetails', { podcast, userRole });
        } else {
          // if users are not premium 
          res.render('unauthorized');
        }
      } else if (podcast.userRole === 'VIP') {
        //access for both Premium and VIP users
        if (userRole === 'Premium' || userRole === 'VIP') {
          res.render('podcastDetails', { podcast, userRole });
        } else {
          // if users are not premium or vip
          res.render('unauthorized');
        }
      } else {
        //access for all user roles for Free content
        res.render('podcastDetails', { podcast, userRole });
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

// for editing the podcast details
router.get('/:id/edit', auth.isAdmin, (req, res, next) => {
  let id = req.params.id;
  const userRole = req.session.userRole;
  Podcast.findById(id)
    .then((podcast) => {
      res.render('editPodcast', { podcast: podcast, userRole: userRole });
    })
    .catch((error) => {
      console.log(error);
    });
});

// for updating the edited content
router.post(
  '/:id',
  auth.isAdmin,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
  ]),
  (req, res, next) => {
    let id = req.params.id;
    console.log('checking');

    const audioFiles = req.files['audio'];
    const imageFiles = req.files['image'];

    // assign fileds with updated values
    let updates = {
      title: req.body.title,
      description: req.body.description,
      userRole: req.body.userRole,
    };

    // for checking the new file of audio has uploaded
    if (audioFiles && audioFiles.length > 0) {
      updates.audio = audioFiles[0].filename;
    }

    // for checking the new file of image has uploaded
    if (imageFiles && imageFiles.length > 0) {
      updates.image = imageFiles[0].filename;
    }
    // finally uopdating the podcast details
    Podcast.findByIdAndUpdate(id, updates, { new: true })
      .then((result) => {
        res.redirect('/podcasts/' + id);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send('An error occurred while finding the podcast.');
      });
  }
);

// to delete the product
router.get('/:id/delete', auth.isAdmin, (req, res, next) => {
  let id = req.params.id;

  Podcast.findByIdAndDelete(id)
    .then(() => {
      res.redirect('/podcasts');
    })
    .catch((error) => {
      if (error) return next(error);
    });
});

module.exports = router;
