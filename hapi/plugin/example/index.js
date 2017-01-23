'use strict';
const Joi = require('joi');

exports.register = function (server, options, next) {
  // [GET] /example/simple?limit=12
  // [GET] /example/simple
  server.route({
    method: 'GET',
    path: '/example/simple',
    config: {
      auth: false,
      handler: (request, reply) => {
        return reply({
          code: 'ok',
          limit: request.query.limit
        });
      },
      description: 'Simple plugin route',
      validate: {
        query: Joi.object({
          limit: Joi.number().min(0).max(100).default(10).description('example for query params default to 10')
        })
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/example/auth',
    config: {
      auth: 'simple',
      handler: (request, reply) => {
        return reply({
          code: 'ok',
          limit: request.query.limit
        });
      },
      description: 'Simple plugin route with Authentication',
      validate: {
        query: Joi.object({
          limit: Joi.number().min(0).max(100).default(50).description('example for query params default to 50')
        })
      }
    }
  });
  next();
};

exports.register.attributes = {
  name: 'example-plugin',
  dependencies: ['auth-plugin'],
  version: '1.0.0'
};
