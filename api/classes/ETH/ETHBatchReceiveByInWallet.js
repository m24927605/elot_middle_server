const BatchUtil = require('../../utils/BatchUtil');
const ETHUtil = require('../../utils/ETHUtil');
const AssetUtil = require('../../utils/AssetUtil');
const TradeAssetUtil = require('../../utils/TradeAssetUtil');
class ETHBatchReceiveByInWallet {
  constructor() {
    ETHBatchReceiveByInWallet.instance = this;
  }

  async checkInputData(receiveObject, mqid) {
    sails.log.info('[ETHBatchReceiveByInWallet.checkInputData] start: mqid ' + mqid);
    if (!mqid) {
      return false;
    }

    if (!receiveObject.timestamp) {
      return false;
    }

    if (!receiveObject.assetHistory) {
      return false;
    }

    if (!receiveObject.assetHistoryDate) {
      return false;
    }

    if (!receiveObject.userid) {
      return false;
    }

    if (!receiveObject.assetname) {
      return false;
    }

    if (!receiveObject.txid) {
      return false;
    }

    if (!receiveObject.account) {
      return false;
    }

    if (!receiveObject.balance) {
      return false;
    }

    if (!receiveObject.blockNumber) {
      return false;
    }

    let validateRes;
    validateRes = await ETHUtil.validateaddress(receiveObject.account.ETHAccount.address);

    if (!validateRes) {
      return false;
    }
    sails.log.info('[ETHBatchReceiveByInWallet.checkInputData] end: response ' + true);
    return true;
  }
  markNotInProcess(account) {
    sails.log.debug('[ETHBatchReceiveByInWallet.markNotInProcess] start: address' + account.ETHAccount.address);
    return BatchUtil.markAccountNotInProcess(account.ETHAccount.address);
  }
  getReceiveObjectFromInWalletMQ() {
    return BatchUtil.getFromMQ(sails.config.mq.inwallet_mq_eth, 10)
  }
  updateAssetTx(receiveObject) {
    sails.log.info('[ETHBatchReceiveByInWallet.updateAssetTx] start: userid ' + receiveObject.userid + ' assetname: ' + receiveObject.assetname + ' balance : ' + receiveObject.balance + ' txid: ' + receiveObject.txid);
    return TradeAssetUtil.updateAssetTx(receiveObject.txid, sails.config.asset.tx_confirmed);
  }
  updateAssetTxInRedis(assetTx, receiveObject) {
    sails.log.info('[ETHBatchReceiveByInWallet.updateAssetTxInRedis] start: usderid: ' + receiveObject.userid + ' txid: ' + receiveObject.txid + ' assetTx: ' + JSON.stringify(assetTx));
    TradeAssetUtil.addChangedInfoToMq(receiveObject.userid, null, null, null, null, null, null, null, assetTx);    
    return TradeAssetUtil.updateAssetTxInRedis(receiveObject.userid, receiveObject.txid, assetTx);
  }
  isConfirmed(receiveObject) {
    sails.log.info('[ETHBatchReceiveByInWallet.isConfirmed] start: txid ' + receiveObject.txid);
    return new Promise(async (resolve, reject) => {
      const trans = await ETHUtil.getTransactionReceipt(receiveObject.txid);
      if (trans) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }
  setReceiveAddressUnlocked(receiveObject) {
    sails.log.info('[ETHBatchReceiveByInWallet.setReceiveAddressUnlocked] start ');
    let accountName = String(receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag;
    sails.log.info('[ETHBatchReceiveByInWallet.setReceiveAddressUnlocked] detail : address ' + receiveObject.account[accountName].address);
    return AssetUtil.setReceiveAddressStatus(receiveObject.account[accountName].address, false);
  }
  updateAssetHistoryInRedis(userid, assetHistory, assetHistoryDate) {
    sails.log.info('[ETHBatchReceiveByInWallet.updateAssetHistoryInRedis] start: userid ' + userid + ' assetHistory:' + JSON.stringify(assetHistory) + ' assetHistoryDate: ' + assetHistoryDate);
    return AssetUtil.updateAssetHistoryInRedis(userid, assetHistory, assetHistoryDate, sails.config.asset.assets_history_state_deposited_checked);
  }
  updateAssetHistoryChecked(id) {
    sails.log.info('[ETHBatchReceiveByInWallet.updateAssetHistoryChecked] start: id ' + id);
    return AssetUtil.updateAssetHistory(id, sails.config.asset.assets_history_state_deposited_checked);
  }
  removeReceiveObjectFromInWalletMQ(id) {
    sails.log.info('[ETHBatchReceiveByInWallet.removeReceiveObjectFromInWalletMQ] start: id ' + id);
    return BatchUtil.removeFromMQ(sails.config.mq.inwallet_mq_eth, id)
  }
}
module.exports = ETHBatchReceiveByInWallet;