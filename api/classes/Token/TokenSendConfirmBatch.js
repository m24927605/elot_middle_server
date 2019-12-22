let BatchUtil = require('../../utils/BatchUtil');
let TokenUtil = require('../../utils/TokenUtil');
let AssetUtil = require('../../utils/AssetUtil');
let TradeAssetUtil = require('../../utils/TradeAssetUtil');
class TokenSendConfirmBatch {
    constructor() {
        TokenSendConfirmBatch.instance = this;
        this.index = 0;
        this.topic = null;
    }
    getSendObjFromSendConfrimMQ() {
        //sails.log.info('[TokenSendConfirmBatch.getSendObjFromSendConfrimMQ] start sendMQName ' + sails.config.constant.send_mq_flag + String( sails.config.mq.tokens[this.index] ).toLowerCase() + sails.config.constant.confirm_flag );
        const sendConfirmMQName = sails.config.constant.send_mq_flag + String(sails.config.mq.tokens[this.index]).toLowerCase() + sails.config.constant.confirm_flag;
        this.index++;
        if (this.index == sails.config.mq.tokens.length) {
            this.index = 0;
        }
        this.topic = sails.config.mq[sendConfirmMQName];
        return BatchUtil.getFromMQ(sails.config.mq[sendConfirmMQName], 10)
    }
    isConfirmed(txid) {
        sails.log.info('[TokenSendConfirmBatch.isConfirmed] start: txid ' + txid);
        return new Promise(async (resolve, reject) => {
            if (!txid) {
                return reject(new Error('txid_null'));
            }
            const trans = await TokenUtil.getTransactionReceipt(txid);
            if (trans) {
                return resolve(true);
            } else {
                return resolve(false);
            }
        });
    }
    afterConfirmed(sendObject) {
        sails.log.info('[TokenSendConfirmBatch.afterConfirmed] start: sendObject ' + JSON.stringify(sendObject));
        return new Promise(async (resolve, reject) => {
            try {
                const assetTx = await TradeAssetUtil.updateAssetTx(sendObject.txid, sails.config.asset.tx_confirmed);
                TradeAssetUtil.addChangedInfoToMq(sendObject.userid, null, null, null, null, null, null, null, assetTx);
                await TradeAssetUtil.updateAssetTxInRedis(sendObject.userid, sendObject.txid, assetTx);
                resolve(assetTx);
            } catch (error) {
                reject(error);
            }
        });
    }
    async checkInputData(sendObject, mqid) {
        sails.log.info('[TokenSendConfirmBatch.checkInputData] start: userid ' + sendObject.userid);
        this.sendObject = sendObject;
        if (!mqid) {
            return false;
        }
        if (!sendObject.timestamp) {
            return false;
        }
        if (!sendObject.userid) {
            return false;
        }
        if (!sendObject.assetname) {
            return false;
        }
        if (!sendObject.address) {
            return false;
        }
        if (!sendObject.size) {
            return false;
        }
        let validateRes;
        validateRes = await TokenUtil.validateaddress(sendObject.address)
        if (!validateRes) {
            return false;
        }
        sails.log.info('[TokenSendConfirmBatch.checkInputData] end: resp true');
        return true;
    }
    removeSendObjectFromMQ(id) {
        sails.log.info('[TokenSendConfirmBatch.removeSendObjectFromMQ] start topic: ' + this.topic);
        return BatchUtil.removeFromMQ(this.topic, id);
    }
    updateAssetHistoryInRedis(userid, assetHistory, assetHistoryDate) {
        sails.log.info('[TokenSendConfirmBatch.updateAssetHistoryInRedis] start userid :' + userid + ' assetHistory: ' + JSON.stringify(assetHistory) + ' assetHistoryDate: ' + assetHistoryDate);
        return AssetUtil.updateAssetHistoryInRedis(userid, assetHistory, assetHistoryDate, sails.config.asset.assets_history_state_withdraw_checked);
    }
    updateAssetHistoryChecked(id) {
        sails.log.info('[TokenSendConfirmBatch.updateAssetHistoryChecked] start : id ' + id);
        return AssetUtil.updateAssetHistory(id, sails.config.asset.assets_history_state_withdraw_checked);
    }
}

module.exports = TokenSendConfirmBatch;
