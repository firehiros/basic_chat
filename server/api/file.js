
'use strict';

const multer                = require('multer');

const FileConfig            = require('./../config').files;
const File                  = require('./../db/schema/file');
const MessageController     = require('./../core').MessageController;
const FileController        = require('./../core').FileController;

module.exports = function() {
    const app = this.app;
    const authMiddlewares = this.middlewares['auth'];

    if (!FileConfig.enable) {
        return;
    }

    FileController.on('files:new', function(file, room, user) {
        var fileObj = file.toJSON();
        fileObj.owner = user;
        fileObj.room = room.toJSON(user);

        app.io.to(room._id).emit('files:new', fileObj);
    });

    var fileUpload = multer({
        limits: {
            files: 1,
            fileSize: FileConfig.maxFileSize
        },
        storage: multer.diskStorage({})
    }).any();

    //
    // Routes
    //
    app.route('/files')
        .all(authMiddlewares.verifyToken)
        .get(function(req) {
            req.io.route('files:list');
        })
        .post(fileUpload, this.middlewares.cleanupFiles, function(req) {
            req.io.route('files:create');
        });

    app.route('/rooms/:room/files')
        .all(authMiddlewares.verifyToken, this.middlewares.room)
        .get(function(req) {
            req.io.route('files:list');
        })
        .post(fileUpload, this.middlewares.cleanupFiles, function(req) {
            req.io.route('files:create');
        });

    app.route('/files/:id/:name')
        .all(authMiddlewares.verifyToken)
        .get(function(req, res) {
            File.findById(req.params.id, function(err, file) {
                if (err) {
                    // Error
                    return res.send(400);
                }

                var url = FileController.getUrl(file);
                res.sendFile(url, {
                    headers: {
                        'Content-Type': file.type,
                        'Content-Disposition': 'attachment'
                    }
                });

            });
        });

    //
    // Sockets
    //
    app.io.route('files', {
        create: function(req, res) {
            if (!req.files) {
                return res.sendStatus(400);
            }

            let options = {
                owner: req.user._id,
                room: req.param('room'),
                file: req.files[0],
                post: (req.param('post') === 'true') && true
            };

            FileController.create(options, function(err, file) {
                if (err) {
                    console.error(err);
                    return res.sendStatus(400);
                }
                res.status(201).json(file);
            });
        },
        list: function(req, res) {
            let options = {
                userId: req.user._id,
                password: req.param('password'),

                room: req.param('room'),
                reverse: req.param('reverse'),
                skip: req.param('skip'),
                take: req.param('take'),
                expand: req.param('expand')
            };

            FileController.list(options, function(err, files) {
                if (err) {
                    console.error(err);
                    return res.sendStatus(400);
                }

                files = files.map(function(file) {
                    return file.toJSON(req.user);
                });

                res.json(files);
            });
        }
    });
}
