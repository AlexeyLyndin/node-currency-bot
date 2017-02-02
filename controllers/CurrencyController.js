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
    let request = {
        url: "http://www.nbrb.by/API/ExRates/Rates/145",
        json: true,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36",
            "Connection": "keep-alive"
        }
    };
    return new Promise((resolve, reject) => {
        req.get(request, (body, response, err) => {
            if (!err && response.statusCode === 200) {
                console.log(body);
                resolve(body);
            } else {
                reject(err);
            }
        });
    });
};

module.exports = CurrencyController;