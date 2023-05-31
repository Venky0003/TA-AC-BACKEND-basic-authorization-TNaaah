var express = require('express');
var router = express.Router();
var Comment = require('../models/comment');
var Article = require('../models/article');
var auth = require('../middlewares/auth');

router.use(auth.isUserLogged);

// to edit 
router.get('/:id/edit', auth.authorizedToEditComment, (req, res, next) => {
  var id = req.params.id;
  Comment.findById(id)
    .then((comment) => {
      res.render('UpdateComment', { comment: comment });
    })
    .catch((err) => {
      if (err) return next(err);
    });
});

router.post('/:id', (req, res, next) => {
  var id = req.params.id;
  Comment.findByIdAndUpdate(id, req.body)
    .then((comments) => {
      res.redirect('/articles/' + comments.articleId);
    })
    .catch((err) => {
      if (err) return next(err);
    });
});

// to delte the article
router.get('/:id/delete', auth.authorizedToEditComment, (req, res, next) => {
  var commentId = req.params.id;

  Comment.findByIdAndDelete(commentId)
  // Comment.findOneAndDelete({ _id: commentId })
    .then((comment) => {
      Article.findByIdAndUpdate(comment.articleId, {
         $pull: { comments: comment._id },
      })
        .then((article) => {
          res.redirect('/articles/' + comment.articleId);
        })
        .catch((err) => {
          if (err) return next(err);
        });
    })
    .catch((err) => {
      if (err) return next(err);
    });
});

// for likes on the comment
router.get('/:id/likes', (req, res, next) => {
  let commentId = req.params.id;
  Comment.findByIdAndUpdate(commentId, { $inc: { likes: 1 } }).then(
    (comment) => {
      res.redirect('/articles/' + comment.articleId);
    }
  );
});

// for dislikes on the comment
router.get('/:id/dislikes', (req, res, next) => {
  let commentId = req.params.id;

  Comment.findByIdAndUpdate(commentId, { $inc: { dislikes: -1 } })
    .then((comment) => {
      res.redirect('/articles/' + comment.articleId);
    })
    .catch((err) => {
      if (err) return next(err);
    });
});

module.exports = router;
