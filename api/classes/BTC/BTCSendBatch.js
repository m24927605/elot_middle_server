const BatchUtil = require('../../utils/BatchUtil');
const BTCUtil = require('../../utils/BTCUtil');
const AssetUtil = require('../../utils/AssetUtil');
const TradeAssetUtil = require('../../utils/TradeAssetUtil');
const TradeUpdateBalance = require('../Trade/TradeUpdateBalance');
const CommonUtil = require('../../utils/CommonUtil');
class BTCSendBatch {
    constructor() {
        BTCSendBatch.instance = this;
    }

    getSendObjFromSendMQ() {
        // sails.log.info('[BTCSendBatch.getSendObjFromSendMQ] start: sendMQName '+sails.config.mq.send_mq_btc );
        return BatchUtil.getFromMQ(sails.config.mq.send_mq_btc, 10)
    }

    async checkInputData(sendObject, mqid) {
        sails.log.info('[BTCSendBatch.checkInputData] start sendObject ' + JSON.stringify(sendObject) + ' mqid: ' + mqid);
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
        } else {
            sendObject.size = CommonUtil.trimDecimal(sendObject.size, sails.config.asset.asset_decimal);
        }

        let validateRes = await BTCUtil.validateaddress(sendObject.address);
        if (!validateRes) {
            return false;
        }
        sails.log.info('[BTCSendBatch.checkInputData] end : response true ');
        return true;
    }

    updateAsset(userid, size) {
        sails.log.info('[BTCSendBatch.updateAsset] start : userid ' + userid + ' size: ' + size);
        const asset = {};
        asset.userid = userid;
        asset.btcAvailable = size;
        return AssetUtil.updateAssetSend(userid, asset, 'btcAvailable');
    }

    updateAssetInRedis(userid, asset) {
        sails.log.info('[BTCSendBatch.updateAssetInRedis] start: userid ' + userid + ' asset: ' + JSON.stringify(asset));
        return AssetUtil.updateAssetInRedis(userid, asset);
    }

    initAssetHistory(userid, size, txid) {
        sails.log.info('[BTCSendBatch.initAssetHistory] start : userid ' + userid + ' size: ' + size + ' txid: ' + txid);
        return AssetUtil.initAssetHistoryUnchecked(userid, sails.config.asset.assets_btc_name, size, txid, sails.config.asset.assets_history_side_withdraw, sails.config.asset.assets_history_state_withdraw_unchecked);
    }

    initAssetHistoryInRedis(userid, assetHistory, assetHistoryDate) {
        sails.log.info('[BTCSendBatch.initAssetHistoryInRedis] start : userid ' + userid + ' assetHistory: ' + JSON.stringify(assetHistory) + ' assetHistoryDate: ' + assetHistoryDate);
        return AssetUtil.updateAssetHistoryInRedis(userid, assetHistory, assetHistoryDate, sails.config.asset.assets_history_state_withdraw_unchecked);
    }

    sendToAddress(address, size) {
        sails.log.info('[BTCSendBatch.sendToAddress] start: address' + address + ' size: ' + size);
        const transactionFee = sails.config.BTC.sendTransferFee;
        const pk = sails.config.BTC.outPK;
        const to = address;
        const amount = size - sails.config.BTC.sendThreshold;
        return WalletBTCService.transferWithBalanceCheck(to, amount, pk, transactionFee);
    }

    beforeSend(sendObject) {
        sails.log.info('[BTCSendBatch.beforeSend] start : address ' + sails.config.BTC.outAddress);
        return new Promise(async (resolve, reject) => {
            try {
                const unspents = await BTCUtil.listunspent(sails.config.BTC.outAddress);
                const check = await BTCUtil.checkUnspent(unspents, sendObject.size);
                if (check) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    afterSend(sendObject) {
        sails.log.info('[BTCSendBatch.afterSend] start: sendObject ' + JSON.stringify(sendObject));
        return new Promise(async (resolve, reject) => {
            try {
                const updateBalanceProcessor = new TradeUpdateBalance(sendObject.userid, sendObject.assetname, sails.config.trader.business_withdraw, sendObject.size, { msg: 'withdraw' });
                updateBalanceProcessor.updateBalance();
                const assetTx = await TradeAssetUtil.submitAssetTx(sendObject.userid, sendObject.assetname, sendObject.size, sendObject.txid, sails.config.asset.assets_side_withdraw);
                sails.log.info(" ## assetTx ## ", assetTx);
                TradeAssetUtil.addChangedInfoToMq(sendObject.userid, null, null, null, null, null, null, null, assetTx);
                await TradeAssetUtil.updateAssetTxInRedis(sendObject.userid, sendObject.txid, assetTx);
                resolve(assetTx);
            } catch (error) {
                reject(error);
            }
        });
    }
    removeSendObjectFromMQ(id) {
        sails.log.info('[BTCSendBatch.removeSendObjectFromMQ] start: mqid' + id);
        return BatchUtil.removeFromMQ(sails.config.mq.send_mq_btc, id);
    }

    addConfirmSendMQ(sendObject) {
        sails.log.info('[BTCSendBatch.addConfirmSendMQ] start: mq name ' + sails.config.mq.send_mq_btc_confirm);
        return BatchUtil.putToMQ(sails.config.mq.send_mq_btc_confirm, JSON.stringify(sendObject));
    }
}
module.exports = BTCSendBatch;
