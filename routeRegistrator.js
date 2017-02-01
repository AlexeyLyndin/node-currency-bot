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
                    try {
                        let controllerPath = controllersDirectory + fileName;
                        let controller = require(controllerPath);
                        let instance = new controller();
                        let routes = instance.routes();
                        _.keys(routes, (key) => {
                            router.when(
                                new TextCommand(key, routes[key]),
                                instance
                            );
                        });
                    } catch (e) {

                    }
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