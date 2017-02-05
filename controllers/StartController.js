const _ = require("lodash");
const req = require("tiny_request");
const Telegram = require("telegram-node-bot");
const TelegramBaseController = Telegram.TelegramBaseController;

class StartController extends TelegramBaseController {

    startMenu($) {
        $.runInlineMenu({
            layout: 2, //some layouting here
            method: 'sendMessage', //here you must pass the method name
            params: ['text'], //here you must pass the parameters for that method
            menu: [
                {
                    text: '1', //text of the button
                    /*callback: (callbackQuery, message) => { //to your callback will be passed callbackQuery and response from method
                        console.log(message);
                    }*/
                },
                {
                    text: 'Exit',
                    message: 'Are you sure?',
                    layout: 2,
                    menu: [ //Sub menu (current message will be edited)
                        {
                            text: 'Yes!',
                            menu: [{
                                text: 'Are you kidding?',
                                callback: (callbackQuery, message) => {

                                }
                            }]

                        },
                        {
                            text: 'No!',
                            callback: () => {
                                console.log(arguments)
                            }
                        }
                    ]
                }
            ]
        })
    }
    get routes() {
        return {
            "/start": "startMenu"
        }
    }
}

module.exports = StartController;