const _             = require('lodash')
const path          = require('path')
const fs            = require('fs')
const express       = require('express')
const bodyParser    = require('body-parser')
const mongoose      = require('mongoose')
const http          = require('http')
const cors          = require('cors')

const config        = require('./config')
// const auth          = require('./src/core/auth');

const apiList       = require('./api')
const middlewares   = require('./middleware')

var app = express();
app.use(cors());

// HTTP Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// IE header
app.use(function(req, res, next) {
    res.setHeader('X-UA-Compatible', 'IE=Edge,chrome=1');
    next();
});

//
// API
//
_.each(apiList, function(api) {
    api.apply({
        app: app,
        middlewares: middlewares,
        config: config
        // models: models
    });
});

// Set compression before any routes
// app.use(compression({ threshold: 512 }));


// setup authentication
// auth.setup(app);

//
// Mongo
//
mongoose.connection.on('error', function (err) {
    throw new Error(err);
});

mongoose.connection.on('disconnected', function() {
    throw new Error('Could not connect to database');
});

mongoose.connect(config.db, function(err) {
    if (err) {
        throw err;
    }

    //
    // Server
    //
    var httpServer = http.createServer(app);
    httpServer.listen(config.http.port);

    if(config.https.enable){
        var httpsServer = express().createServer({
            key: fs.readFileSync(settings.https.key),
            cert: fs.readFileSync(settings.https.cert),
            passphrase: config.https.passphrase
        });
        httpsServer.listen(config.https.port);
    }
});
