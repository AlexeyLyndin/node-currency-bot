const fs = require("fs");
const _ = require("lodash");
const controllersDirectory = "./controllers/";

class RouteRegistrator {
    registrate(router) {
        getFilesInDirectory()
            .then((files) => {
                _.each(files, (fileName) => {
                   // require controller, getRoutes
                });
            });
    }
}

const getFilesInDirectory = () => {
    return new Promise((resolve, reject) => {
        fs.readdir(controllersDirectory, (err, files) => {
            resolve(files);
        });
    });
}

module.exports = new RouteRegistrator();