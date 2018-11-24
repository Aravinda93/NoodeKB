const   express           =   require('express');
const   path              =   require('path');
const   mongoose          =   require('mongoose');
const   bodyParser        =   require('body-parser')
const   expressValidator  =   require('express-validator');
const   flash             =   require('connect-flash');
const   session           =   require('express-session');
const   config            =   require('./config/database');
const   passport          =   require('passport');

//Connect to DB
mongoose.connect(config.database);
let db = mongoose.connection;

//Check for DB errors
db.on('error', function(err){
  console.log(err);
});

db.once('open', function(){
  console.log("Connected to MongoDB");
})

//Init App
const app      =  express();

//Bring in the MODELS
let Article = require('./models/article');

//Load view Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Set the public Folder
app.use(express.static(path.join(__dirname, 'public')));

//Express-session middelware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//Express Messages middelware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express validator Messages
// In this example, the formParam value is going to get morphed into form body format useful for printing.
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//Passport config
require('./config/passport')(passport);
// Passport middelware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user   =   req.user || null;
  if(req.user)
  {
    res.locals.username = req.user.username;
    //res.locals.name   =   req.name;
  }
  next();
});

// Home Route
app.get('/', function(req, res){
    Article.find({}, function(err, articles){
    if(err)
    {
      console.log("Something wrong while getting data");
    }
    else
    {
      res.render('index', {
        title     : 'All Articles',
        articles  : articles
      });
    }
  });
});

//Route Files
//Router the Users file to User.js
let articles  =   require('./routes/articles');
let users     =   require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);


// Start Server
app.listen(3000, function(){
  console.log("Server Started on Port 3000");
});
