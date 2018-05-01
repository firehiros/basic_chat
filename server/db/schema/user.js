'use strict';

const bcrypt            = require('bcryptjs');
const mongoose          = require('mongoose');
const uniqueValidator   = require('mongoose-unique-validator');
const validate          = require('mongoose-validate');
const config            = require('./../../config');
const jwt               = require('jsonwebtoken');

var ObjectId = mongoose.Schema.Types.ObjectId;

var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: false,
        lowercase: true,
        unique: true,
        trim: true,
        validate: [function(v) {
            return (v.length <= 24);
        }, 'invalid ldap/kerberos username']
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate: [ validate.email, 'Invalid email address' ]
    },
    role: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        trim: true,
        match: [new RegExp(config.auth.passwordRegex), 'Minimum eight characters, at least one letter and one number'],
        set: function(value) {
            return value
        }
    },
    token: {
        type: String,
        required: false,
        trim: true
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        trim: true
    },
    joined: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        trim: true
    },
    rooms: [{
		type: ObjectId,
		ref: 'Room'
    }],
    openRooms: [{
  		type: String,
        trim: true
    }],
	messages: [{
		type: ObjectId,
		ref: 'Message'
	}]
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

UserSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) {
        return next();
    }

    bcrypt.hash(user.password, 10, function(err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        user.joined = Date.now();
        next();
    });
});

UserSchema.statics.findByIdentifier = function(identifier, cb) {
    let opts = {};

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        opts.$or = [
            { _id: identifier },
            { username: identifier }
        ];
    } else if (identifier.indexOf('@') === -1) {
        opts.username = identifier;
    } else {
        opts.email = identifier;
    }

    this.findOne(opts, cb);
};

UserSchema.methods.generateToken = function(cb) {
    if (!this._id) {
        return cb('User needs to be saved.');
    }
    this.token = jwt.sign({
        id: this._id
        // scopes: [this.role]
    }, config.tokenSecrect, {
        expiresIn: 86400 // expires in 24 hours
    });
    return this.token;
};

UserSchema.methods.comparePassword = function(password, cb) {
    // Current password hashes
    bcrypt.compare(password, this.password, function(err, isMatch) {

        if (err) {
            return cb(err);
        }

        if (isMatch) {
            return cb(null, true);
        }

        cb(null, false);

    });

};

UserSchema.statics.authenticate = function(identifier, password, cb) {
    this.findByIdentifier(identifier, function(err, user) {
        if (err) {
            return cb(err);
        }

        // Does the user exist?
        if (!user) {
            return cb(null, null, false);
        }

        // Is password okay?
        user.comparePassword(password, function(err, isMatch) {
            if (err) {
                return cb(err);
            }
            if (isMatch) {
                return cb(null, user, isMatch);
            }
            // Bad password
            return cb(null, null, isMatch);
        });
    });
};
UserSchema.statics.updateProfile = function(id, options, cb) {
    var usernameChange = false;
    
    this.findById(id, function (err, user) {
        if (err) {
            return cb(err);
        }

        if (options.firstName) {
            user.firstName = options.firstName;
        }
        if (options.lastName) {
            user.lastName = options.lastName;
        }
        if (options.displayName) {
            user.displayName = options.displayName;
        }
        if (options.email) {
            user.email = options.email;
        }
        if (options.avatar) {
            user.avatar = options.avatar;
        }

        if (options.openRooms) {
            user.openRooms = options.openRooms;
        }

        if (options.password || options.newPassword) {
            user.password = options.password || options.newPassword;
        }

        user.save(function(err, user) {
            if (err) {
                return cb(err);
            }

            if (cb) {
                cb(null, user);
            }

        });
    });
};

UserSchema.plugin(uniqueValidator);

// EXPOSE ONLY CERTAIN FIELDS
// It's really important that we keep
// stuff like password private!
UserSchema.method('toJSON', function() {
    return {
        id: this._id,
        firstName: this.firstName,
        lastName: this.lastName,
        username: this.username,
        displayName: this.displayName,
        avatar: this.avatar,
        openRooms: this.openRooms,
    };
});

module.exports = mongoose.model('User', UserSchema);
