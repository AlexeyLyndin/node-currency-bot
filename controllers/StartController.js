const _ = require("lodash");
const req = require("tiny_request");
const Telegram = require("telegram-node-bot");
const BanksRepository = require('../repository/BanksRepository');
const TelegramBaseController = Telegram.TelegramBaseController;
const urls = ["http://www.nbrb.by/API/ExRates/Rates/145", "http://www.nbrb.by/API/ExRates/Rates/292", "http://www.nbrb.by/API/ExRates/Rates/298"];

class StartController extends TelegramBaseController {

    constructor(data) {
        super()
        this.repository = new BanksRepository();
    }

    startMenu($) {
        let bankNames = getBankNamesFormEnv()

        let otherBanksMenu = {
            message: 'Выберите банк',
            layout: 3
        }
        bankNames.forEach((name) => {
            console.log(name)
            otherBanksMenu[name.toString()] = ($) => {
                this.repository.getBanksData($.message.text).then(foundBank => {
                    let response = ""
                    response += `USD Покупка/Продажа - ${foundBank.usdBuy}/${foundBank.usdSell}\n`
                    response += `EUR Покупка/Продажа - ${foundBank.euroBuy}/${foundBank.euroSell}\n`
                    response += `RUB Покупка/Продажа - ${foundBank.rubBuy}/${foundBank.rubSell}\n`
                    console.log(response)
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
                    console.log('НБРБ')
                    getDefaultCurrencies().then((results) => {
                        console.log(results);
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

const getDefaultCurrencies = () => {
    let requests = [];
    _.each(urls, (url) => {
        let req = performRequest(url);
        requests.push(req);
    });
    return Promise.all(requests).then((responses) => {
        return responses;
    });
};

const performRequest = (url) => {
    let request = {
        url: url,
        json: true,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36",
            "Connection": "keep-alive"
        }
    };
    return new Promise((resolve, reject) => {
        req.get(request, (body, response, err) => {
            if (!err && response.statusCode === 200) {
                resolve(body);
            } else {
                reject(err);
            }
        });
    });
}

const getBankNamesFormEnv = () => {
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