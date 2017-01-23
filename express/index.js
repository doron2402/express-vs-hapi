'use strict';
const PORT = process.env.PORT || 3000;
const PASSWORD = process.env.PASSWORD || 'foobar';
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const app = module.exports = express();
const hash = require('./pass').hash;
const mw = require('./mw');
const _ = require('lodash');
// dummy database
const users = require('./db').users;

/**
 * Module dependencies.
 */

// config
app
  .set('view engine', 'ejs')
  .set('views', __dirname + '/views');

// middleware
app
  .use(bodyParser.urlencoded({ extended: false }))
  .use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'shhhh, very secret'
}))
  .use(mw.sessionPresisted);

// when you create a user, generate a salt
hash(PASSWORD, function(err, salt, hash){
  if (err) throw err;
  _.forEach(users,(user) => {
    users[user.name.toLowerCase()].salt = salt;
    users[user.name.toLowerCase()].hash = hash;
  });
});

// Authenticat9e using our plain-object database of doom!
const authenticate = ({ username, password }, fn) => {
  const user = users[username];
  // query the db for the given username
  if (!user) {
    return fn(new Error('cannot find user'));
  }
  // apply the same algorithm to the POSTed password, applying
  // the hash against the pass / salt, if there is a match we
  // found the user
  hash(password, user.salt, function(err, hash) {
    if (err) {
      return fn(err);
    }
    if (hash == user.hash) {
      return fn(null, user);
    }
    fn(new Error('invalid password'));
  });
}


app.get('/', function(req, res){
  res.redirect(301, '/login');
});

app.get('/restricted', mw.checkAuth, (req, res) => {
  res.locals.message = 'Wahoo! restricted area, click to <a href="/logout">logout</a>';
  res.render('restricted');
});

app.get('/logout', function(req, res){
  // destroy the user's session to log them out
  // will be re-created next request
  req.session.destroy(function(){
    res.redirect('/');
  });
});

app.get('/login', function(req, res){
  res.render('login');
});

app.post('/login', mw.log, function(req, res){
  authenticate(req.body, function(err, user){
    if (user) {
      // Regenerate session when signing in
      // to prevent fixation
      req.session.regenerate(function(){
        // Store the user's primary key
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = user;
        req.session.success = 'Authenticated as ' + user.name
          + ' click to <a href="/logout">logout</a>. '
          + ' You may now access <a href="/restricted">/restricted</a>.';
        res.redirect('/restricted');
      });
    } else {
      req.session.error = 'Authentication failed, please check your '
        + ' username and password.'
        + ` (use "doron" or "john" with passowrd ${PASSWORD})`;
      res.redirect('/login');
    }
  });
});

app
  .use(mw.notFound)
  .use(mw.errorHandler);
/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}
