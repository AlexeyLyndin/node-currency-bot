const _ = require("lodash");
const req = require("tiny_request");
const http = require("http");
const htmlparser = require("htmlparser2");

let rowTag = "";
let bankNameTag = "";
let currTag = "";

let bankData = [];
let bankDataObj;
let currencyArray = [];

let resolve, reject;

const parser = new htmlparser.Parser({
    onopentag: (name, attribs) => {
        if ("tr" === name) {
            if (attribs['data-key']) {
                bankDataObj = {};
                rowTag = name;
            }
        }
        if ("span" === name) {
            if (attribs.class && attribs.class.includes("iconb")) {
                bankNameTag = name;
            }
        }
        if ("span" === name) {
            if (attribs.class && attribs.class.includes("first_curr")) {
                currTag = name;
            }
        }

    },
    ontext: (text) => {
        if (rowTag) {
            if (bankNameTag) {
                bankDataObj.bankName = text
            }
            if (currTag && text) {
                currencyArray.push(text)
            }
        }

    },
    onclosetag: (tagName) => {
        if (rowTag === tagName) {
            // renew all temporary values
            rowTag = ""
            parseValues()
            bankData.push(bankDataObj)
            bankDataObj = {}
            currencyArray = []
        }
        if (bankNameTag === tagName) {
            bankNameTag = ""
        }
        if (currTag === tagName) {
            currTag = ""
        }
    },
    onend: () => {
        resolve(bankData);
    }
}, { decodeEntities: true });

const parseValues = () => {
    bankDataObj.usdBuy = currencyArray[0];
    bankDataObj.usdSell = currencyArray[1];
    bankDataObj.euroBuy = currencyArray[2];
    bankDataObj.euroSell = currencyArray[3];
    bankDataObj.rubBuy = currencyArray[4];
    bankDataObj.rubSell = currencyArray[5];
}

const getHtml = () => {
    return new Promise((res, rej) => {
        http.get('http://myfin.by/currency/minsk', (response) => {
            resolve = res;
            reject = rej;
            const statusCode = response.statusCode;
            const contentType = response.headers['content-type'];

            let error;
            if (statusCode !== 200) {
                error = new Error(`Request Failed.\n` +
                    `Status Code: ${statusCode}`);
            }

            if (error) {
                console.log(error.message);
                response.resume();
                return;
            }

            response.setEncoding('utf8');
            response.pipe(parser);
        }).on('error', (e) => {
            console.log(`Got error: ${e.message}`);
        });
    });
}

const getDataFromCache = (bankName) => {
    return null
}

class BanksRepository {
    getBanksData(bankName) {
        return new Promise((res, rej) => {
            let bankData = getDataFromCache(bankName)
            if (!bankData) {
                getHtml().then((banks) => {
                    bankData = _.find(banks, (bank) => {
                        return bank.bankName === bankName
                    })
                    res(bankData)
                })
            }
        })
    }

}

module.exports = BanksRepository;