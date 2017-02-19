const _ = require("lodash");
const req = require("tiny_request");
const RedisStorage = require("./RedisStorage")



class BanksRepository {

    constructor() {
        this.redisStorage = new RedisStorage()
    }
    getBanksData(bankName) {
       return this.redisStorage.getOtherBanksData(bankName)
    }

    getDefaultCurrencies() {
        return this.redisStorage.getNBRBData()
    }

}

module.exports = BanksRepository;