const _             = require('lodash')
const path          = require('path')
const fs            = require('fs')
const express       = require('express.oi');
const bodyParser    = require('body-parser')
const mongoose      = require('mongoose')
const http          = require('http')
const cors          = require('cors')
const socket        = require('socket.io')

const config        = require('./config')
// const auth          = require('./src/core/auth');

const apiList       = require('./api')
const middlewares   = require('./middleware')

var app = express();
if(config.https.enable){
    app = app.https({
        key: fs.readFileSync(settings.https.key),
        cert: fs.readFileSync(settings.https.cert),
        passphrase: config.https.passphrase
    }).io();

    // var httpsServer = express().createServer({
    //     key: fs.readFileSync(settings.https.key),
    //     cert: fs.readFileSync(settings.https.cert),
    //     passphrase: config.https.passphrase
    // });
    // httpsServer.listen(config.https.port);
} else {
    app = app.http().io();
}

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

// Cors Error
app.use(cors());

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
    
    app.listen(config.http.port);

    // //
    // // Server
    // //
    // var httpServer = http.createServer(app);
    //
    //
    // if(config.https.enable){
    //     var httpsServer = express().createServer({
    //         key: fs.readFileSync(settings.https.key),
    //         cert: fs.readFileSync(settings.https.cert),
    //         passphrase: config.https.passphrase
    //     });
    //     httpsServer.listen(config.https.port);
    // }
});
