const DBUtil = require('../utils/DBUtil');
const frontConfig = {};
const netWorks = {};
const withdrawFee = {};
module.exports = {
    getFrontConfig: function () {
        frontConfig.marketDecimal = sails.config.trader.market_param;
        frontConfig.traderBalance = sails.config.trader.traderBalance;
        frontConfig.netWorks = netWorks;
        frontConfig.assets = sails.config.globals.coins;
        frontConfig.withdrawFee = withdrawFee;
        return frontConfig;
    },
    fetchConfigs: function () {
        sails.log.info('[APIAdminService.fetchConfigs] start: ');
        return new Promise(resolve => {
            let config = JSON.parse(JSON.stringify(sails.config.globals));
            delete config.eth_out_privatekey;
            delete config.gas_tanker_privatekey;
            delete config.token_out_privatekey;
            delete config.btc_out_privatekey;
            resolve(config);
        });
    },
    loadConfig: function () {
        sails.log.info('[APIAdminService.loadConfig] start: ');
        return new Promise(async resolve => {
            try {
                for (let i = 0; i < sails.config.globals.coins.length; i++) {
                    const coin = sails.config.globals.coins[i];
                    const rec = await DBUtil.loadConfig(coin)
                    if (rec[0] && rec[0].inEncryptedPK && rec[0].outEncryptedPK) {
                        sails.config[coin] = rec[0];
                        sails.config[coin].inPK = rec[0].inEncryptedPK;
                        sails.config[coin].outPK = rec[0].outEncryptedPK;
                        netWorks[coin] = rec[0].confirmBlockNumer;
                        withdrawFee[coin] = rec[0].sendThreshold;
                    }
                    sails.log.info('[APIAdminService.loadConfig] coin record: ' + JSON.stringify(rec[0]));
                }
                resolve();
            } catch (error) {
                reject(error);
                sails.log.error(error);
            }

        })
    },
    getConfig: function (coin) {
        sails.log.info('[APIAdminService.getConfig] start: coin: ' + coin);
        return DBUtil.loadConfig(coin);
    },
    updateConfig: function (coin, updateConfig) {
        sails.log.info('[APIAdminService.updateConfig] start: ');
        return DBUtil.updateConfig(coin, updateConfig);
    },
    createConfig: function (newConfig) {
        sails.log.info('[APIAdminService.createConfig] start: ');
        let promise;
        try {
            promise = DBUtil.createConfig(newConfig);
        } catch (error) {
            sails.log.error(error);
        }
        return promise;
    },
    getConfigEntity: function (reqData) {
        sails.log.info('[APIAdminService.getConfigEntity] start: ');
        const updateConfig = {};
        updateConfig.coin = reqData.coin;
        if (reqData.confirmBlockNumer) {
            updateConfig.confirmBlockNumer = reqData.confirmBlockNumer;
        }

        if (reqData.inAddress) {
            updateConfig.inAddress = reqData.inAddress;
        }

        if (reqData.inEncryptedPK) {
            updateConfig.inEncryptedPK = reqData.inEncryptedPK;
        }

        if (reqData.outEncryptedPK) {
            updateConfig.outEncryptedPK = reqData.outEncryptedPK;
        }

        if (reqData.outAddress) {
            updateConfig.outAddress = reqData.outAddress;
        }

        if (reqData.receiveThreshold) {
            updateConfig.receiveThreshold = reqData.receiveThreshold;
        }

        if (reqData.sendThreshold) {
            updateConfig.sendThreshold = reqData.sendThreshold;
        }
        if (reqData.receiveTransferFee) {
            updateConfig.receiveTransferFee = reqData.receiveTransferFee;
        }
        if (reqData.sendTransferFee) {
            updateConfig.sendTransferFee = reqData.sendTransferFee;
        }
        if (reqData.contract) {
            updateConfig.contract = reqData.contract;
        }
        if (reqData.decimal) {
            updateConfig.decimal = reqData.decimal;
        }
        return updateConfig;
    }
}