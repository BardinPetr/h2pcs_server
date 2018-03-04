const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const flash = require('connect-flash');

dotenv.load();

const routes = require('./routes/index');
const user = require('./routes/user');

const strategy = new Auth0Strategy({
        domain: process.env.AUTH0_DOMAIN,
        clientID: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        callbackURL: process.env.AUTH0_CALLBACK_URL
    },
    function(accessToken, refreshToken, extraParams, profile, done) {
        return done(null, profile);
    }
);

passport.use(strategy);

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    session({
        secret: process.env["AUTH0_CLIENT_SECRET"],
        resave: true,
        saveUninitialized: true
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

app.use(function(req, res, next) {
    if (req && req.query && req.query.error) {
        req.flash("error", req.query.error);
    }
    if (req && req.query && req.query.error_description) {
        req.flash("error_description", req.query.error_description);
    }
    next();
});

app.use(function(req, res, next) {
    res.locals.lamp = true;
    res.locals.loggedIn = false;
    if (req.session.passport && typeof req.session.passport.user != 'undefined') {
        res.locals.loggedIn = true;
    }
    next();
});

app.use('/', routes);
//app.use('/user', user);

app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;