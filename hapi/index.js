'use strict';
const Bcrypt = require('bcrypt');
const Hapi = require('hapi');
const ExamplePlugin = require('./plugin/example');
const Auth = require('./plugin/auth');
const server = new Hapi.Server();
server.connection({ port: 5000 });

server.register([Auth, ExamplePlugin], (err) => {

    if (err) {
        throw err;
    }

    server.start((err) => {

        if (err) {
            throw err;
        }

        console.log('server running at: ' + server.info.uri);
    });
});