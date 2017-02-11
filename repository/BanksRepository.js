const _ = require("lodash");
const req = require("tiny_request");
const http = require("http");
const htmlparser = require("htmlparser2");

let rowTag = "";
let bankNameTag = "";
let currTag = "";

let bankData = [];
let bankDataObj;
let currencyString = "";

let resolve, reject;

const parser = new htmlparser.Parser({
    onopentag: (name, attribs) => {
        if (name === "tr") {
            if (attribs.class && attribs.class.includes("link")) {
                bankDataObj = {};
                rowTag = name;
            } else {
                rowTag = ""
            }
        }
        if ("span" === name) {
            if (attribs.class && attribs.class.includes("iconb")) {
                bankNameTag = name;
            } else {
                bankNameTag = "";
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
                bankDataObj.bankName = text;
                //console.log(`Bank name is ${text}`);
                bankNameTag = "";
                return;
            }
            if (currTag) {
                currencyString += `;${text.trim()}`;
                currTag = "";
            }

        }
    },
    onclosetag: (tagname) => {
        if (rowTag === tagname) {
            rowTag = "";
            bankNameTag = "";
            parseValues(currencyString);
            currencyString = "";
            bankData.push(bankDataObj);
        }
    },
    onend: () => {
        console.log("end");
        resolve(bankData);
    }
}, { decodeEntities: true });

const parseValues = (rawString) => {
    var split = rawString.split(';');
    //console.log(split);
    if (split.length !== 8) { return; }
    bankDataObj.usdBuy = split[2];
    bankDataObj.usdSell = split[3];
    bankDataObj.euroBuy = split[4];
    bankDataObj.euroSell = split[5];
    bankDataObj.rubBuy = split[6];
    bankDataObj.rubSell = split[7];
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

class BanksRepository {
    getBanksData() {
        return getHtml()
    }
}

module.exports = BanksRepository;