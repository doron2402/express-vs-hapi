'use strict';
//external plugin
const Bcrypt = require('bcrypt');
const Basic = require('hapi-auth-basic');


const users = {
    john: {
        username: 'john',
        password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm',   // 'secret'
        name: 'John Doe',
        id: '2133d32a'
    }
};

const validate = function (request, username, password, callback) {
    const user = users[username];
    if (!user) {
        return callback(null, false);
    }

    Bcrypt.compare(password, user.password, (err, isValid) => {
        callback(err, isValid, { id: user.id, name: user.name });
    });
};

exports.register = function (server, options, next) {
  // Basic authentication wrapper
  server.register(Basic, (err) => {
    // Setting the authentication strategy
    server.auth.strategy('simple', 'basic', { validateFunc: validate });
    next();
  })
};

exports.register.attributes = {
  name: 'auth-plugin',
  // dependencies: [],
  version: '1.0.0'
};
