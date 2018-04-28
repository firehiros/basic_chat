'use strict';

const bcrypt            = require('bcryptjs');
const mongoose          = require('mongoose');
const uniqueValidator   = require('mongoose-unique-validator');
const validate          = require('mongoose-validate');
const config            = require('./../../config');

var ObjectId = mongoose.Schema.Types.ObjectId;

var UserSchema = new mongoose.Schema({
    provider: {
        type: String,
        required: true,
        trim: true
    },
    uid: {
        type: String,
        required: false,
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
        validate: [ validate.email, 'invalid email address' ]
    },
    password: {
        type: String,
        required: true,
        trim: true,
        match: new RegExp(config.auth.passwordRegex),
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
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    displayName: {
        type: String,
        required: true,
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
    this.token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
    });
};

UserSchema.methods.comparePassword = function(password, cb) {

    // Legacy password hashes
    if (hash.sha256(password, 10) === this.password) {
        return cb(null, true);
    }

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
            return cb(null, null, 0);
        }

        // Is password okay?
        user.comparePassword(password, function(err, isMatch) {
            if (err) {
                return cb(err);
            }
            if (isMatch) {
                return cb(null, user);
            }
            // Bad password
            return cb(null, null, 1);
        });
    });
};

UserSchema.plugin(uniqueValidator, {
    message: 'Expected {PATH} to be unique'
});

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
