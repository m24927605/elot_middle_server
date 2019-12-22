const BatchUtil = require('../../utils/BatchUtil');
const ETHUtil = require('../../utils/ETHUtil');
const AssetUtil = require('../../utils/AssetUtil');
const TradeAssetUtil = require('../../utils/TradeAssetUtil');

class ETHSendConfirmBatch {
  constructor() {
    ETHSendConfirmBatch.instance = this;
  }

  getSendObjFromSendConfrimMQ() {
    //sails.log.info('[ETHSendConfirmBatch.getSendObjFromSendConfrimMQ] start: sendMQName ' +  sails.config.mq.send_mq_eth_confirm);
    return BatchUtil.getFromMQ(sails.config.mq.send_mq_eth_confirm, 10)
  }

  isConfirmed(txid) {
    sails.log.info('[ETHSendConfirmBatch.isConfirmed] start: txid ' + txid);
    return new Promise(async (resolve, reject) => {
      if (!txid) {
        return reject(new Error('txid_null'));
      }
      let trans = await ETHUtil.getTransactionReceipt(txid);
      if (trans) {
        return resolve(true);
      } else {
        return resolve(false);
      }
    })
  }

  afterConfirmed(sendObject) {
    sails.log.info('[ETHSendConfirmBatch.afterConfirmed] start: sendObject ' + JSON.stringify(sendObject));
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
    sails.log.info('[ETHSendConfirmBatch.checkInputData] start: userid ' + sendObject.userid);
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
    validateRes = await ETHUtil.validateaddress(sendObject.address)
    if (!validateRes) {
      return false;
    }
    sails.log.info('[ETHSendConfirmBatch.checkInputData] end: resp true');
    return true;
  }

  removeSendObjectFromMQ(id) {
    sails.log.info('[ETHSendConfirmBatch.removeSendObjectFromMQ] start mqid: ' + id);
    return BatchUtil.removeFromMQ(sails.config.mq.send_mq_eth_confirm, id);
  }

  updateAssetHistoryInRedis(userid, assetHistory, assetHistoryDate) {
    sails.log.info('[ETHSendConfirmBatch.updateAssetHistoryInRedis] start userid :' + userid + ' assetHistory: ' + JSON.stringify(assetHistory) + ' assetHistoryDate: ' + assetHistoryDate);
    return AssetUtil.updateAssetHistoryInRedis(userid, assetHistory, assetHistoryDate, sails.config.asset.assets_history_state_withdraw_checked);
  }

  updateAssetHistoryChecked(id) {
    sails.log.info('[ETHSendConfirmBatch.updateAssetHistoryChecked] start : id ' + id);
    return AssetUtil.updateAssetHistory(id, sails.config.asset.assets_history_state_withdraw_checked);
  }
}
module.exports = ETHSendConfirmBatch;
