let BatchUtil = require('../utils/BatchUtil');
var TokenGasSendBatch = require('../classes/Token/TokenGasSendBatch');
var TokenGasSendConfirmBatch = require('../classes/Token/TokenGasSendConfirmBatch');
const tokenGasSendBatch = new TokenGasSendBatch();
const tokenGasSendConfirmBatch = new TokenGasSendConfirmBatch();

module.exports = {
    addGasTankerMQ: function (gasTankerObject) {
        sails.log.info('[WalletGasTankerService.addGasTankerMQ] start: gasTankerObject ' + JSON.stringify(gasTankerObject));
        return new Promise(async (resolve, reject) => {
            try {
                if (!gasTankerObject.timestamp) {
                    return reject('timestamp_not_existed');
                }
                if (!gasTankerObject.userid) {
                    return reject('userid_not_existed');
                }
                if (!gasTankerObject.assetname) {
                    return reject('assetname_not_existed');
                }
                if (!gasTankerObject.address) {
                    return reject('address_not_existed');
                }
                if (!gasTankerObject.size) {
                    return reject('size_not_existed');
                }
                BatchUtil.putToMQ(sails.config.mq.send_from_gas_tanker, JSON.stringify(gasTankerObject)).then((result) => {
                    sails.log.info('[GASTankerService.addGasTankerMQ] end : response mqid :' + result);
                    return resolve(result);
                });
            } catch (error) {
                reject(error);
            }
        });
    },
    run: function () {
        sails.log.info('[WalletGasTankerService.runGasTankerService] start');
        WalletBatchGasTankerService.processGasSend(tokenGasSendBatch);
        WalletBatchGasTankerService.processGasSendConfirm(tokenGasSendConfirmBatch);
    }
}