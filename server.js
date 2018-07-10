// server.js

// set up ======================================================================
// get all the tools we need
let express  = require('express');
let app      = express();
let port     = process.env.PORT || 8080;
let mongoose = require('mongoose');
let passport = require('passport');
let flash    = require('connect-flash');

let OauthServer = require('oauth2-server');
let authHelper = require('./app/authorization/helper');

let morgan       = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser   = require('body-parser');
let session      = require('express-session');

let configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.oauth = new OauthServer({
    // require authorization model definitions
    model: require('./app/authorization/model'),
    grants: ['client_credentials'],
    accessTokenLifetime: 10, // 4 * 60 * 60
    debug: true,
});
app.all('/oauth/token', authHelper(app).token);
app.use('/api', authHelper(app).authenticate);

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
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

app.route('/api/test')
    .get((req, res) => {
        // console.log('api test...! ', res);
        res.json({ message: "granted" });
    });

// require('./app/routes/authRoutes')(app);

// require('./app/authorization/model').loadExampleData();

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
