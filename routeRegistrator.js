const fs = require("fs");
const _ = require("lodash");
const controllersDirectory = "./controllers/";

const Telegram = require('telegram-node-bot')
const TextCommand = Telegram.TextCommand

class RouteRegistrator {
    registrate(router) {
        getFilesInDirectory()
            .then((files) => {
                _.each(files, (fileName) => {
                    registrateController(router, fileName);
                });
            });
    }
}

const registrateController = (router, controllerName) => {
    try {
        let controllerPath = controllersDirectory + controllerName;
        let controller = require(controllerPath);
        let instance = new controller();
        let routes = instance.routes;
        _.each(_.keys(routes), (key) => {
            router.when(
                new TextCommand(key, key),
                new controller()
            );
        });


    } catch (e) {
        console.error(`Unable to register ${controllerName}`);
        console.error(`Unable to register ${e}`);

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