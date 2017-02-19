const _ = require("lodash");
const req = require("tiny_request");
const Telegram = require("telegram-node-bot");
const BanksRepository = require('../repository/BanksRepository');
const TelegramBaseController = Telegram.TelegramBaseController;

class StartController extends TelegramBaseController {

    constructor(data) {
        super()
        this.repository = new BanksRepository();
    }

    startMenu($) {
        let bankNames = getBankNamesFromEnv()

        let otherBanksMenu = {
            message: 'Выберите банк',
            layout: 2
        }
        bankNames.forEach((name) => {
            otherBanksMenu[name] = ($) => {
                this.repository.getBanksData($.message.text).then(foundBank => {
                    let response = ""
                    response += `USD Покупка/Продажа - ${foundBank.usdBuy} / ${foundBank.usdSell}\n`
                    response += `EUR Покупка/Продажа - ${foundBank.euroBuy} / ${foundBank.euroSell}\n`
                    response += `RUB Покупка/Продажа - ${foundBank.rubBuy} / ${foundBank.rubSell}\n`
                    $.sendMessage(response).then(() => {
                        otherBanks()
                    })
                })
            }
        })
        otherBanksMenu['Назад'] = () => {
            mainMenu()
        }

        const mainMenu = () => {
            $.runMenu({
                message: 'Выберите источник',
                layout: 2,
                'НБРБ': () => {
                    this.repository.getDefaultCurrencies().then((results) => {
                        let response = "";
                        _.each(results, (result) => {
                            response += `${result.Cur_Abbreviation} - ${result.Cur_OfficialRate} \n`;
                        });
                        $.sendMessage(response).then(() => {
                            mainMenu()
                        });
                    })
                },
                'Другое': () => {
                    otherBanks()
                }
            })
        }
        const otherBanks = () => {
            $.runMenu(otherBanksMenu)
        }
        mainMenu()
    }

    get routes() {
        return {
            "/start": "startMenu"
        }
    }
}

const getBankNamesFromEnv = () => {
    const bankPrefix = "BANK_NAME_"
    let index = 1
    let bankName = ""
    let bankNames = []
    do {
        let envBankName = bankPrefix + index
        bankName = process.env[envBankName]
        if (bankName) {
            bankNames.push(bankName)
        }
        index++

    } while (bankName)

    return bankNames
}


module.exports = StartController;