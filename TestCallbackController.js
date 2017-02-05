const _ = require("lodash");
const req = require("tiny_request");
const Telegram = require("telegram-node-bot");
const TelegramBaseCallbackQueryController = Telegram.TelegramBaseCallbackQueryController;

class TestCallbackController extends TelegramBaseCallbackQueryController {
    handle($) {
        console.log($);
    }
}

module.exports = TestCallbackController;