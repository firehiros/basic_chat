'use strict';

let init = () => {

    // let redisURI 		= require('url').parse(process.env.REDIS_URL);
    // let redisPassword 	= redisURI.auth.split(':')[1];
	if(process.env.NODE_ENV === 'production') {
		return {
            db: 'mongodb://localhost/exchange_prod',
            sessionSecret: process.env.sessionSecret,
            http: {
                host: 'localhost',
                port: 80,
                enable: true
            },
            https:{
                enable: true,
                port: 5001,
                key: '',
                cert: '',
				passphrase: ''
            },
            auth: {
                type: 'local',
                enableRegistration: true;
            }
			// redis: {
			// 	host: redisURI.hostname,
			// 	port: redisURI.port,
			// 	password: redisPassword
			// }
		}
	} else if(process.env.NODE_ENV === 'develop')(
		return {
            db: 'mongodb://localhost/exchange_dev',
            sessionSecret: process.env.sessionSecret,
            http: {
                host: 'localhost',
                port: 8000,
                enable: true
            },
            https:{
                enable: false,
                port: 5001,
                key: '',
                cert: ''
            },
            auth: {
                type: 'local',
                enableRegistration: true;
            }
			// redis: {
			// 	host: redisURI.hostname,
			// 	port: redisURI.port,
			// 	password: redisPassword
			// }
		}
    )
    // Default config
	else {
		return {
            db: 'mongodb://localhost/exchange_test',
            sessionSecret: process.env.sessionSecret,
            http: {
                host: 'localhost',
                port: 8080,
                enable: true
            },
            https:{
                enable: false,
                port: 5001,
                key: '',
                cert: ''
            },
            auth: {
                type: 'local',
                enableRegistration: true;
            }
			// redis: {
			// 	host: redisURI.hostname,
			// 	port: redisURI.port,
			// 	password: redisPassword
			// }
		}
	}
}

module.exports = init();
