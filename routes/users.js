const   express   =   require('express');
const   router    =   express.Router();
const   bcrypt    =   require('bcryptjs');
const   passport  =   require('passport');

//Bring in the User Model
let     User      =   require('../models/user');

//Load the user form for register
router.get('/register', function(req, res){
  res.render('register');
});

router.post('/register', function(req, res){

  const name      =   req.body.name;
  const email     =   req.body.email;
  const username  =   req.body.username;
  const password  =   req.body.password;
  const password2 =   req.body.Password2;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty().isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Password does not match').equals(req.body.password);

  //Get All the errors
  let errors = req.validationErrors();

  if(errors)
  {
    res.render('register',{
      errors  : errors,
      title   : 'Sign-up  Users'
    });
  }
  else
  {
    let newUser   =   new User({
      name      :   name,
      email     :   email,
      username  :   username,
      password  :   password
    });

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if(err)
        {
          console.log("Error with hashing password" + err)
        }
        else
        {
          newUser.password = hash;
          newUser.save(function(err){
            if(err)
            {
              console.log("Error in creating the new User"+err);
              return;
            }
            else
            {
              req.flash('success', 'You are now registered and can log in');
              res.redirect('/users/login');
            }
          });
        }
      });
    });
  }
});

router.get('/login', function(req, res){
  res.render('login');
});

//Login Process
router.post('/login', function(req, res, next){
  passport.authenticate('local',{
    successRedirect   :   '/',
    failureRedirect   :   '/users/login',
    failureFlash      :   true
  })(req, res, next);
});

//Logout the user
router.get('/logout', function(req, res, next){
  req.logout();
  req.flash('success', 'You have logged out');
  res.redirect('/users/login');
});

module.exports = router;
