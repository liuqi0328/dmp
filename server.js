var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

// Pass passport for configuration
require('./config/passport')(passport);

// Connect with our database:
var configDB = require('./config/database.js');
mongoose.Promise = require('bluebird'); // used for promises. Not sure if needed...

// -------------- LINK TO MONGO DB -------------------
mongoose.connect(configDB.url, {
	useMongoClient: true // If bluebird not needed, delelete this!
});
let db = mongoose.connection;

// Check connection
db.once('open', function(){
  console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function(err){
  console.log(err);
});

// -------------- SET UP EXPRESS APP -------------------
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

// Get information from html forms
// Needed to communicate between client and server. 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

// Set up ejs for templating
app.set('view engine', 'ejs');

// -------------- REQUIREMENTS PASSPORT -------------------
app.use(session({
   secret: 'ilovescotchscotchyscotchscotch', // session secret
   resave: true,
   saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// --------------------- ROUTES ---------------------------
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// -------------------- LAUNCH -----------------------------
app.listen(port);
console.log('The magic happens on port ' + port);
