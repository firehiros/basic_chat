'use strict';

let init = () => {
    // let redisURI 		= require('url').parse(process.env.REDIS_URL);
    // let redisPassword 	= redisURI.auth.split(':')[1];
	let config = {
		tokenSecrect: process.env.SECRECT,
		auth: {
			enableRegistration: true,
			passwordRegex: "^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9!$%@#£€*?&]{8,}$" //Minimum eight characters, at least one letter and one number
		},
		files: {
			enable: true,
			maxFileSize: 100000000,
			restrictTypes: false,
			allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
			local: {
				dir: 'uploads'
			}

		}
	}

	if(process.env.NODE_ENV === 'production') {
		return Object.assign({
			db: 'mongodb://localhost/exchange_prod',
			http: {
				host: 'localhost',
				port: 80,
				enable: true
			},
			https:{
				enable: false,
				port: 5001,
				key: '',
				cert: ''
			},
		}, config);
	} else if(process.env.NODE_ENV === 'development') {

		return Object.assign({
			db: 'mongodb://localhost/exchange_dev',
			http: {
				port: 3000,
				enable: true
			},
			https:{
				enable: false,
				port: 5001,
				key: '',
				cert: ''
			},
		}, config);
    }
    // Default config
	else {

		return Object.assign({
			db: 'mongodb://localhost/exchange_test',
			http: {
				port: 8000,
				enable: true
			},
			https:{
				enable: false,
				port: 5001,
				key: '',
				cert: ''
			},
		}, config);
	}
}

module.exports = init();
