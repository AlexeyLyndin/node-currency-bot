const _ = require("lodash");
const req = require("tiny_request");
const Telegram = require("telegram-node-bot");
const TelegramBaseController = Telegram.TelegramBaseController;

class StartController extends TelegramBaseController {

    startMenu($) {
        const mainMenu = () =>{
            $.runMenu({
                message: 'Выберите источник',
                layout: 2,
                'НБРБ': () =>{
                    console.log('НБРБ')
                    mainMenu()
                },
                'Другое': () =>{
                    otherBanks()
                }
            })
        }
        const otherBanks = () =>{
            $.runMenu({
                message: 'Выберите банк',
                layout: 2,
                'Мой банк': () => {
                    console.log('мой банк')
                    otherBanks()
                },
                'Назад': () =>{
                    mainMenu()
                }
            })
        }
        mainMenu()
    }
    get routes() {
        return {
            "/start": "startMenu"
        }
    }
}

let that = this;


module.exports = StartController;