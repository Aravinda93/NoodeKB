const   express   =   require('express');
const   router    =   express.Router();


//Bring in the Article MODELS
let Article = require('../models/article');

//Bring in the user models
let  User   = require('../models/user')

//Add Route
router.get('/add', ensureAuthenticated, function(req, res){
  res.render('add', {
    title : 'Add Articles'
  });
});

//Add a new Article to de
router.post('/add',ensureAuthenticated, function(req, res){

  req.checkBody('title', 'Title is required').notEmpty();
  //req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();

  //Get errors
  let errors = req.validationErrors();

  if(errors)
  {
    res.render('add', {
      errors  : errors,
      title   : 'Add Article'
    })
  }
  else
  {
    let article     = new Article();
    article.title   = req.body.title;
    article.body    = req.body.body;
    article.author  = req.user._id;

    article.save(function(err){
      if(err)
      {
        console.log(err);
        return;
      }
      else {
        req.flash('success', 'Article has been added successfully');
        res.redirect('/');
      }
    });
  }
});

//Edit the Article in Edit form
router.get('/edit/:id', ensureAuthenticated, function(req, res){
  Article.findById(req.params.id, function(err, article){
    if(err)
    {
      console.log("Something Went Wrong \n"  + err);
    }
    else
    {
        if(article.author != req.user._id)
        {
          req.flash('danger', 'Not Authorized');
          res.redirect('/');
        }
        else
        {
          console.log(article);
          res.render('edit_article',{
            title   : 'Edit',
            article : article
          });
      }
    }
  });
});

//Insert the edited data from
router.post('/edit/:id', function(req, res){

  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();

  //Get all the errors
  let errors = req.validationErrors();

  if(errors)
  {
    Article.findById(req.params.id, function(err, article){
      if(err)
      {
        console.log("Something Went Wrong \n"  + err);
      }
      else
      {
          console.log(article);
          res.render('edit_article',{
            errors  :   errors,
            title   :  'Edit Article',
            article :   article
          });
      }
    });
  }
  else
  {
    let article     =   {};
    article.title   =   req.body.title;
    article.author  =   req.body.author;
    article.body    =   req.body.body;

    let query       =   {_id:req.params.id};

    Article.update(query, article, function(err){
      if(err)
      {
        console.log("Something Went Wrong \n"  + err);
      }
      else
      {
        req.flash('success', 'Article has been Updated');
        res.redirect('/');
      }
    });
  }
});

//Delete the particular Articles
router.delete('/:id', ensureAuthenticated, function(req, res){
  if(!req.user._id)
  {
    res.status(500).send();
  }

  let query = {_id:req.params.id}

  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id)
    {
      res.status(500).send();
    }
    else
    {
      Article.remove(query, function(err){
        if(err)
        {
          console.log("Something Went Wrong \n"  + err);
        }
        else
        {
          res.send('success');
        }
      });
    }
  });
});

//Get Single Article data
router.get('/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    if(err)
    {
      console.log("Something Went Wrong \n" + err);
    }
    else
    {
      User.findById(article.author, function(err, user){
        res.render('article',{
          article   :   article,
          author    :   user.name
        });
      });
    }
  });
});

// Access control
function ensureAuthenticated(req, res, next)
{
  if(req.isAuthenticated())
  {
    return next();
  }
  else
  {
    req.flash('danger', 'Please Login');
    res.redirect('/users/login');
  }
}

module.exports = router;
