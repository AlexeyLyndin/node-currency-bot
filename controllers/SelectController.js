const _ = require("lodash");
const req = require("tiny_request");
const Telegram = require("telegram-node-bot");
const TelegramBaseController = Telegram.TelegramBaseController;

const http = require("http");

const htmlparser = require("htmlparser2");


let rowTag = "";
let bankNameTag = "";

let bankData = [];
let bankDataObj;

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

    },
    ontext: (text) => {
        if (rowTag) {
            if (bankNameTag) {
                bankDataObj.bankName = text;
                console.log(`Bank name is ${text}`);
                return;
            }
            console.log(text);
        }
    },
    onclosetag: (tagname) => {
        if (rowTag === tagname) {
            rowTag = "";
            bankNameTag = ""
            bankData.push(bankDataObj);
        }
        if (bankNameTag) {
            bankNameTag = "";
        }
    },
    onend: () => {
        console.log("end");
        console.log(bankData);
    }
}, { decodeEntities: true });

class SelectController extends TelegramBaseController {

    select($) {
        getHtml()
    }

    get routes() {
        return {
            "/select": "select"
        }
    }
}

const getHtml = () => {
    http.get('http://myfin.by/currency/minsk', (res) => {
        const statusCode = res.statusCode;
        const contentType = res.headers['content-type'];

        let error;
        if (statusCode !== 200) {
            error = new Error(`Request Failed.\n` +
                `Status Code: ${statusCode}`);
        }
        if (error) {
            console.log(error.message);
            // consume response data to free up memory
            res.resume();
            return;
        }


        res.setEncoding('utf8');
        res.pipe(parser);
    }).on('error', (e) => {
        console.log(`Got error: ${e.message}`);
    });
}

module.exports = SelectController;