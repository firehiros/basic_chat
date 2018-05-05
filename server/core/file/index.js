'use strict';

const fs = require('fs');
const path = require('path');

module.exports = class FileHandler {
    constructor(options){
        this.options = options;

        this.getUrl = this.getUrl.bind(this);
        this.save = this.save.bind(this);
    }

    getUrl(file) {
        return path.resolve(this.options.dir + '/' + file._id);
    }

    save(options, callback) {
        let file = options.file;
        let doc = options.doc;
        let fileFolder = doc._id;
        let filePath = fileFolder + '/' + encodeURIComponent(doc.name);
        let newPath = this.options.dir + '/' + fileFolder;

        this.copyFile(file.path, newPath, (err) => {

            if (err) {
                return callback(err);
            }

            // Let the clients know about the new file
            var url = '/files/' + filePath;
            callback(null, url, doc);
        });
    }
    copyFile(path, newPath, callback) {
        fs.readFile(path, (err, data) => {
            if (err) {
                return callback(err);
            }

            fs.writeFile(newPath, data, (err) => {
                callback(err);
            });
        });
    }
}
