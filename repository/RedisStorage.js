const redis = require("redis");
const _ = require("lodash");
const req = require("tiny_request");

const http = require("http");
const htmlparser = require("htmlparser2");

class RedisStorage {

    constructor() {
        this.client = redis.createClient({
            host: '0.0.0.0',
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PWD
        })

        this.listener = redis.createClient({
            host: '0.0.0.0',
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PWD
        })

        this._initListeners()
    }

    setBankData(pattern, channel, message) {
        if (message === 'nbrb') {
            getNBRBCurrencies().then((nbrbArray) => {
                this.client.psetex(message, process.env.TTL, JSON.stringify(nbrbArray))
                console.log('nbrb stored in cache')
            })
        }

        if (message === 'other') {
            getHtml().then((otherArray) => {
                console.log('other stored in cache')
                this.client.psetex(message, process.env.TTL, JSON.stringify(otherArray))
            })
        }

    }

    getBankData(bankKey, bankName) {
        if ('nbrb' === bankKey) {
            return new Promise((resolve, reject) => {
                this.client.get(bankKey, (err, val) => {
                    if (!err && val) {
                        console.log('got from cache')
                        resolve(JSON.parse(val))
                    } else {
                        console.log('got from web')
                        getNBRBCurrencies().then((nbrbArray) => {
                            this.client.psetex(bankKey, process.env.TTL, JSON.stringify(nbrbArray))
                            resolve(nbrbArray)
                        })

                    }
                })
            })
        }

        if ('other' === bankKey) {
            return new Promise((resolve, reject) => {
                this.client.get(bankKey, (err, val) => {
                    if (!err && val) {
                        console.log('got from cache')
                        let foundBank = _.find(JSON.parse(val), (bank) => {
                            return bank.bankName === bankName
                        })
                        resolve(foundBank)
                    } else {
                        console.log('got from web')
                        getHtml().then((otherArray) => {
                            let foundBank = _.find(otherArray, (bank) => {
                                return bank.bankName === bankName
                            })
                            resolve(foundBank)
                            console.log(foundBank)
                            this.client.psetex(bankKey, process.env.TTL, JSON.stringify(otherArray))
                        })
                    }
                })
            })
        }
    }

    getOtherBanksData(bankName) {
        return this.getBankData('other', bankName)
    }

    getNBRBData() {
        return this.getBankData('nbrb')
    }

    _initListeners() {
        this.listener.config("SET", "notify-keyspace-events", "AKE");
        this.listener.psubscribe("__keyevent@0__:expired");
        this.listener.on('pmessage', (pattern, channel, message) => {
            this.setBankData(pattern, channel, message)
        });
    }
}

module.exports = RedisStorage



const urls = ["http://www.nbrb.by/API/ExRates/Rates/145", "http://www.nbrb.by/API/ExRates/Rates/292", "http://www.nbrb.by/API/ExRates/Rates/298"];

const getNBRBCurrencies = () => {
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