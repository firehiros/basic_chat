var _       = require('lodash')
var path    = require('path')
var fs      = require('fs')
var express = require('express')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')

var config  = require('./config')
var auth    = require('./src/core/auth')

var app = express();

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

// Set compression before any routes
app.use(compression({ threshold: 512 }));

app.use(cookieParser());

// setup authentication
auth.setup(app);

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
