'use strict';

const Hapi = require('hapi');
const exec = require('child_process').exec;
const buildAwesome = 'npm run awesome';
const buildAllRepo = 'npm run build';
const pushToGithub = 'npm run push';

const server = new Hapi.Server();

server.connection({ port: process.env.PORT || 3000 });

server.route({
    method: 'GET',
    path: '/',
    handler: (request, reply) => reply.view('index', { status: 'in index' }),
  });

server.route({
  method: 'GET',
  path: '/awesome',
  handler: (request, reply) => {
    let status = 'awesome successfully.';
    try {
      exec(buildAwesome, finishCommand);
    } catch (e) {
      console.error(e);
      status = 'awesome fail.';
    }

    return reply.view('index', { status: status });
  },
});

server.route({
  method: 'GET',
  path: '/build',
  handler: (request, reply) => {
    let status = 'built successfully.';
    try {
      exec(buildAllRepo, finishCommand);
    } catch (e) {
      status = 'built fail';
      console.error(e);
    }

    return reply.view('index', { status: status });
  },
});

server.route({
  method: 'GET',
  path: '/push',
  handler: (request, reply) => {
    let status = 'push successfully.';

    try {
      exec(pushToGithub, finishCommand);
    } catch (e) {
      status = 'push fail';
      console.error(e);
    }

    return reply.view('index', { status: status });
  },
});

var plugins = [
    require('vision'),
    require('hapi-heroku-helpers'),
];

const finishCommand = (err, stdout, stderr) => {
  if (err) {
    console.log(stderr);
  } else {
    console.log(stdout);
  }
};

const registerView =  (err) => {
  // Error logging.
  if (err) {
    console.error('Failed to load plugins:', err);
  }

  // Reigister the view.
  server.views({
      engines: {
          hbs: require('handlebars'),
        },
      relativeTo: __dirname,
      path: 'views',
    });

  server.start(() => {
      console.log('Server running at:', server.info.uri);
    });
};

server.register(plugins, registerView);
