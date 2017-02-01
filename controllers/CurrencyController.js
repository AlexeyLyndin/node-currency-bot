const req = require("tiny_request");
const Telegram = require("telegram-node-bot");
const TelegramBaseController = Telegram.TelegramBaseController;

class CurrencyController extends TelegramBaseController {

    getCurrency($) {
        getUdsCurrency()
        .then((usd) => {
            $.sendMessage(usd);
        })
        .catch((err) => {
            console.error(err);
        });
    }

    get routes() {
        return {
            "/currency": "getCurrency"
        }
    }
}

const getUdsCurrency = () => {
    return new Promise((resolve, reject) => {
        req.get({ url: "http://www.nbrb.by/API/ExRates/Rates/145", json: true }, (body, response, err) => {
            if (!err && response.statusCode === 200) {
                console.log(body);
                resolve(body);
            }else{
                reject(err);
            }
        });
    });
};

module.exports = CurrencyController;