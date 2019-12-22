const BatchUtil = require('../../utils/BatchUtil');
const BTCUtil = require('../../utils/BTCUtil');
const AssetUtil = require('../../utils/AssetUtil');
const TradeAssetUtil = require('../../utils/TradeAssetUtil');
class BTCSendConfirmBatch {
    constructor() {
        BTCSendConfirmBatch.instance = this;
    }

    getSendObjFromSendConfrimMQ() {
        // sails.log.info('[BTCSendConfirmBatch.getSendObjFromSendConfrimMQ] start : sendMQName '+sails.config.mq.send_mq_btc_confirm);
        return BatchUtil.getFromMQ(sails.config.mq.send_mq_btc_confirm, 10)
    }

    isConfirmed(txid) {
        sails.log.info('[BTCSendConfirmBatch.isConfirmed] start: txid: ' + txid);
        return new Promise(async (resolve, reject) => {
            try {
                let trans = await BTCUtil.gettransaction(txid);
                sails.log.info('[BTCSendConfirmBatch.isConfirmed] transaction detail: ' + JSON.stringify(trans));
                if (trans && trans.confirmations > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    afterConfirmed(sendObject) {
        sails.log.info('[BTCSendConfirmBatch.afterConfirmed] start: sendObject ' + JSON.stringify(sendObject));
        return new Promise(async (resolve, reject) => {
            try {
                let assetTx = await TradeAssetUtil.updateAssetTx(sendObject.txid, sails.config.asset.tx_confirmed);
                 TradeAssetUtil.addChangedInfoToMq(sendObject.userid, null, null, null, null, null, null, null, assetTx);
                await TradeAssetUtil.updateAssetTxInRedis(sendObject.userid, sendObject.txid, assetTx);
                resolve(assetTx);
            } catch (error) {
                reject(error);
            }

        });
    }

    async checkInputData(sendObject, mqid) {
        sails.log.info('[BTCSendConfirmBatch.checkInputData] start: userid ' + sendObject.userid);
        if (!mqid) {
            sails.log.error('[BTCSendConfirmBatch.checkInputData]  invalid mqid:' + mqid);
            return false;
        }

        if (!sendObject.timestamp) {
            sails.log.error('[BTCSendConfirmBatch.checkInputData]  invalid sendObject.timestamp:' + sendObject.timestamp);
            return false;
        }

        if (!sendObject.userid) {
            sails.log.error('[BTCSendConfirmBatch.checkInputData]  invalid sendObject.userid:' + sendObject.userid);
            return false;
        }

        if (!sendObject.assetname) {
            sails.log.error('[BTCSendConfirmBatch.checkInputData]  invalid sendObject.assetname:' + sendObject.assetname);
            return false;
        }

        if (!sendObject.address) {
            sails.log.error('[BTCSendConfirmBatch.checkInputData]  invalid sendObject.address:' + sendObject.address);
            return false;
        }

        if (!sendObject.size) {
            sails.log.error('[BTCSendConfirmBatch.checkInputData]  invalid sendObject.size:' + sendObject.size);
            return false;
        }

        let validateRes = await BTCUtil.validateaddress(sendObject.address);
        if (!validateRes) {
            sails.log.error('[BTCSendConfirmBatch.checkInputData]  invalid validateRes:' + validateRes);
            return false;
        }
        sails.log.info('[BTCSendConfirmBatch.checkInputData] end: resp true');
        return true;
    }

    removeSendObjectFromMQ(id) {
        sails.log.info('[BTCSendConfirmBatch.removeSendObjectFromMQ] start mqid: ' + id);
        return BatchUtil.removeFromMQ(sails.config.mq.send_mq_btc_confirm, id);
    }

    updateAssetHistoryInRedis(userid, assetHistory, assetHistoryDate) {
        sails.log.info('[BTCSendConfirmBatch.updateAssetHistoryInRedis] start userid :' + userid + ' assetHistory: ' + JSON.stringify(assetHistory) + ' assetHistoryDate: ' + assetHistoryDate);
        return AssetUtil.updateAssetHistoryInRedis(userid, assetHistory, assetHistoryDate, sails.config.asset.assets_history_state_withdraw_checked);
    }

    updateAssetHistoryChecked(id) {
        sails.log.info('[BTCSendConfirmBatch.updateAssetHistoryChecked] start : id ' + id);
        return AssetUtil.updateAssetHistory(id, sails.config.asset.assets_history_state_withdraw_checked);
    }
}
module.exports = BTCSendConfirmBatch;
