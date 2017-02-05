require("dotenv").config();
const Telegram = require("telegram-node-bot");
const TelegramBaseController = Telegram.TelegramBaseController;
const TextCommand = Telegram.TextCommand;
const registrator = require("./routeRegistrator");
const CallbackQuery = require("./TestCallbackController");
const tg = new Telegram.Telegram(process.env.BOT_KEY, {
    workers: 4
});

registrator.registrate(tg.router);


tg.router.callbackQuery(new CallbackQuery());