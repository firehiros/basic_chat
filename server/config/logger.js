var winston = require('winston');
winston.emitErrs = true;

module.exports = new winston.Logger({
    transports: [
        new winston.transports.File({
            level: 'info',
            filename: './logs/full.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: true
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});
