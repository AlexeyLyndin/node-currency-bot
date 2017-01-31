const Telegram = require("telegram-node-bot");
const TelegramBaseController = Telegram.TelegramBaseController;

class PongController extends TelegramBaseController {

    pongHandler($) {
        $.sendMessage("ping")
    }

    get routes() {
        return {
            "pongCommand": "pongHandler"
        }
    }
}

module.exports = {
    controller: new PongController(),
    command: "pongCommand"
}