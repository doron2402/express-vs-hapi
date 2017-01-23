'use strict';

const MW = {};

MW.log = (req, res, next) => {
  //log something to the console
  console.log(`[${req.protocol}] ${req.path}`);
  if (req.body) {
    console.log(`Body: ${JSON.stringify(req.body)}`);
  }
  if (req.query) {
    console.log(`Query: ${JSON.stringify(req.query)}`);
  }
  next();
};

MW.checkAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
};

MW.notFound = (req, res, next) => {
  return res.json({
    body: 'NotFound'
  }).status(404);
};

MW.errorHandler = (error, req, res, next) => {
  console.log(`>> Error ${JSON.stringify(error)}`);
  return res.json({
    body: {
      error
    }
  }).status(500);
};

MW.sessionPresisted = (req, res, next) => {
  var err = req.session.error;
  var msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
};


module.exports= MW;

