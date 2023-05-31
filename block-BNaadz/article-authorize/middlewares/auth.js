var User = require('../models/user');
var Article = require('../models/article');
var Comment = require('../models/comment');
var flash = require('connect-flash');

module.exports = {
  isUserLogged: (req, res, next) => {
    if (req.session && req.session.userId) {
      next();
    } else {
      res.redirect('/users/login');
    }
  },

  userInfo: (req, res, next) => {
    var userId = req.session && req.session.userId;
    if (userId) {
      User.findById(userId, 'firstName lastName email').then((user) => {
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

  authorizedTo: (req, res, next) => {
    var loggedInUserId = req.user.id;
    var articleId = req.params.id;
    Article.findById(articleId)
      .then((article) => {
        if (!article) {
          // if the Article is not found
          req.flash('error', 'Article not found');
          return res.redirect('back');
        }

        //logged-in user is the author of the article
        if (article.author.toString() !== loggedInUserId) {
         // not authorized to delete the article
          req.flash('error', 'Only the Author can Modify/Delete The Article');
          return res.redirect('back');
        }

        // User is authorized next
        next();
      })
      .catch((error) => {
        // Handle any errors 
        console.error(error);
        req.flash('error', 'Server Error');
        res.redirect('back');
      });
  },

  authorizedToEditComment: (req, res, next) => {
    var loggedInUserId = req.user.id;
    var commentId = req.params.id;

// if the logged in userid and the owner id matches then we can operate it
    Comment.findById(commentId)
      .then((comment) => {
        if (!comment) {
          // Comment not found
          req.flash('error', 'Comment not found');
          return res.redirect('back');
        }

        // logged-in user is the author of the comment
        if (comment.commentorId.toString() !== loggedInUserId) {
          // not authorized to edit/delete the comment
          req.flash('error', 'Only the comment author can edit/delete the comment');
          return res.redirect('back');
        }

        // User is authorized next
        next();
      })
      .catch((error) => {
        // Handle any errors 
        console.error(error);
        req.flash('error', 'Server Error');
        res.redirect('back');
      });
  }
};
