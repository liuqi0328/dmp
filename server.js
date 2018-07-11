// server.js

// set up ======================================================================
// get all the tools we need
let express  = require('express');
let app      = express();
let port     = process.env.PORT || 8080;
let mongoose = require('mongoose');
let passport = require('passport');
let flash    = require('connect-flash');

let morgan       = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser   = require('body-parser');
let session      = require('express-session');

let configDB = require('./config/database.js');
let authHelper = require('./app/authorization/helper');

// -------------- LINK TO MONGO DB -------------------
mongoose.connect(configDB.url, {
    useMongoClient: true, // If bluebird not needed, delelete this!
});
let db = mongoose.connection;

// Check connection
db.once('open', () => console.log('Connected to MongoDB'));

// set up our express application
app.use('/api', authHelper.authenticate);

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({extended: true}));

// Set up ejs for templating
app.set('view engine', 'ejs');

// -------------- REQUIREMENTS PASSPORT -------------------
app.use(session({
    secret: 'ilovescotchscotchyscotchscotch', // session secret
    resave: true,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes/routes')(app, passport); // load our routes and pass in our app and fully configured passport

require('./app/api/routes/apiRoutes')(app);

// authHelper.loadSampleApp();

// -------------------- LAUNCH -----------------------------
app.listen(port);
console.log('The magic happens on port ' + port);
