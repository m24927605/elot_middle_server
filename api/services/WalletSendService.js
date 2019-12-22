const BatchUtil = require('../utils/BatchUtil');
const RedisUtil = require('../utils/RedisUtil');
const DBUtil = require('../utils/DBUtil');

module.exports = {
    findorCreateSendAddresses: (userid, coin) => {
        sails.log.info('[WalletSendService.findorCreateSendAddresses] start: userid ' + userid + ' coin:' + coin);
        return DBUtil.findorCreateSendAddresses({ userid, coin }, { userid, coin, addressList: [] });
    },
    updateSendAddresses: (userid, coin, addressList) => {
        sails.log.info('[WalletSendService.updateSendAddresses] start: userid ' + userid + ' coin:' + coin + ' addressList: ' + JSON.stringify(addressList));
        return DBUtil.updateSendAddresses({ userid, coin }, { userid, coin, addressList });
    },
    emailConfirm: async (key) => {
        sails.log.info('[WalletSendService.emailConfirm] start: key ' + key);
        const value = await RedisUtil.hget(sails.config.redis.email_url_hashkey, key);
        if (value === sails.config.constant.over_time) {
            return sails.config.constant.over_time;
        } else {
            await RedisUtil.hset(sails.config.redis.email_url_hashkey, key, true);
            return true;
        }
    },
    addSendObjectToPreSendMQ: (sendObject) => {
        sails.log.info('[WalletSendService.addSendObjectToPreSendMQ] start: userid ' + sendObject.userid + ' assetname : ' + sendObject.assetname + ' size:' + sendObject.size);
        return new Promise(async (resolve, reject) => {
            if (!sendObject.timestamp) {
                return reject('timestamp_not_existed');
            }
            if (!sendObject.userid) {
                return reject('userid_not_existed');
            }
            if (!sendObject.assetname) {
                return reject('assetname_not_existed');
            }
            if (!sendObject.address) {
                return reject('address_not_existed');
            }
            if (!sendObject.size) {
                return reject('size_not_existed');
            }

            BatchUtil.putToMQ(sails.config.mq.presend_mq, JSON.stringify(sendObject)).then((result) => {
                sails.log.info('[WalletSendService.addSendObjectToPreSendMQ] end : response mqid :' + result);
                return resolve(result);
            });
        });
    },
    addSendObjectToSendMQ: (sendObject) => {
        sails.log.info('[WalletSendService.addSendObjectToSendMQ] start: userid ' + sendObject.userid + ' assetname : ' + sendObject.assetname + ' size:' + sendObject.size);
        return new Promise(async (resolve, reject) => {
            if (!sendObject.timestamp) {
                return reject('timestamp_not_existed');
            }
            if (!sendObject.userid) {
                return reject('userid_not_existed');
            }
            if (!sendObject.assetname) {
                return reject('assetname_not_existed');
            }
            if (!sendObject.address) {
                return reject('address_not_existed');
            }
            if (!sendObject.size) {
                return reject('size_not_existed');
            }
            let assetsName = sails.config.constant.asset_flag + String(sendObject.assetname).toLowerCase() + sails.config.constant.name_flag;
            let exchangSendMQToken = sails.config.constant.send_mq_flag + String(sendObject.assetname).toLowerCase();

            if (sendObject.assetname == sails.config.asset.assets_eth_name) {
                if (sendObject.size < sails.config.ETH.sendThreshold) {
                    return reject('size_not_enough');
                }
                BatchUtil.putToMQ(sails.config.mq.send_mq_eth, JSON.stringify(sendObject)).then((result) => {
                    sails.log.info('[WalletSendService.addSendObjectToSendMQ] end : response mqid :' + result);
                    return resolve(result);
                });
            } else if (sendObject.assetname == sails.config.asset.assets_btc_name) {
                if (sendObject.size < sails.config.BTC.sendThreshold) {
                    return reject('size_not_enough');
                }
                BatchUtil.putToMQ(sails.config.mq.send_mq_btc, JSON.stringify(sendObject)).then((result) => {
                    sails.log.info('[WalletSendService.addSendObjectToSendMQ] end : response mqid :' + result);
                    return resolve(result);
                });
            } else if (sails.config.asset[assetsName]) {
                if (sendObject.size < sails.config[String(sendObject.assetname).toUpperCase()].sendThreshold) {
                    return reject('size_not_enough');
                }
                BatchUtil.putToMQ(sails.config.mq[exchangSendMQToken], JSON.stringify(sendObject)).then((result) => {
                    sails.log.info('[WalletSendService.addSendObjectToSendMQ] end : response mqid :' + result);
                    return resolve(result);
                });
            }
        });
    },
    run: function () {
        sails.log.info('[WalletSendService.run] start');
        WalletSendService.runBTC();
        WalletSendService.runETH();
        WalletSendService.runToken();
        WalletBatchPresendService.processPresend();
        WalletBatchPresendService.processPresendConfirm();
    },
    runBTC: function () {
        sails.log.info('[WalletSendService.run] start');
        WalletBatchBTCService.processSend();
        WalletBatchBTCService.processSendConfirm();

    },
    runETH: function () {
        sails.log.info('[WalletSendService.runETH] start');
        WalletBatchETHService.processSend();
        WalletBatchETHService.processSendConfirm();
    },
    runToken: function () {
        sails.log.info('[WalletSendService.runToken] start');
        WalletBatchTokenService.processSend();
        WalletBatchTokenService.processSendConfirm();
    }
}