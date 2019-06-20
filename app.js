/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');

const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env' });

/**
 * Validators
 */
//const { check, validationResult, body } = require('express-validator/check');
const adminValidators = require('./validators/admin.validators')()//(check, body, validationResult);
const leagueValidators = require('./validators/league.validators')()
const authValidators = require('./validators/auth.validators')()

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const leagueController = require('./controllers/league')
const adminController = require('./controllers/admin')

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

const cors = require('cors');
//app.use(cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:4000");
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST, PATCH');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
/**
 * Connect to MongoDB.
 */
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  store: new MongoStore({
    url: process.env.MONGODB_URI,
    autoReconnect: true,
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', authValidators.signinValidator, userController.postLogin);
app.get('/me', passportConfig.isAuthenticated, userController.me);
app.get('/logout', userController.logout);

app.get('/signup', userController.getSignup);
app.post('/signup', authValidators.signupValidator, userController.postSignup);
app.get('/league/matches', passportConfig.isAuthenticated, leagueController.getMatches);
app.post('/admin/player', passportConfig.isAuthenticated, adminController.createPlayer)
app.get('/admin/players', passportConfig.isAuthenticated, adminController.getAllPlayers)
app.post('/admin/winner', passportConfig.isAuthenticated, adminValidators.chooseWinnerValidator, adminController.chooseWinner)
app.post('/admin/match', passportConfig.isAuthenticated, adminValidators.createMatchValidator, adminController.createMatch)
app.get('/league/matches', passportConfig.isAuthenticated, leagueController.getMatches)
app.post('/league/fantasy-team', passportConfig.isAuthenticated, leagueValidators.createTeamValidator, leagueController.createFantasyTeam)
app.get('/league/players', passportConfig.isAuthenticated, leagueController.getPlayers)
app.patch('/league/fantasy-team', passportConfig.isAuthenticated, leagueValidators.createTeamValidator, leagueController.updateFantasyTeam)
app.get('/league/fantasy-teams', passportConfig.isAuthenticated, leagueController.getFantasyTeams)



/**
 * Error Handler.
 */
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === 'development')
    console.error(err);
  else if (err.isServer)
    console.error(err)
  if (err.isBoom)
    return res.status(err.output.statusCode).json(err.output.payload);
  else {
    console.log(err)
    return res.status(500, "Internal Server Error")
  }
});
//}

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
