const BatchUtil = require('../../utils/BatchUtil');
const BTCUtil = require('../../utils/BTCUtil');
const AssetUtil = require('../../utils/AssetUtil');
const TradeAssetUtil = require('../../utils/TradeAssetUtil');
class BTCBatchReceiveByInWallet {
  constructor() {
    BTCBatchReceiveByInWallet.instance = this;
  }

  async checkInputData(receiveObject, mqid) {
    sails.log.info('[BTCBatchReceiveByInWallet.checkInputData] start mqid: ' + mqid + ' userid:' + receiveObject.userid);
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
    validateRes = await BTCUtil.validateaddress(receiveObject.account.BTCAccount.address)

    if (!validateRes) {
      return false;
    }
    return true;
  }

  setReceiveAddressUnlocked(receiveObject) {
    sails.log.info('[BTCBatchReceiveByInWallet.setReceiveAddressUnlocked] start ');
    let accountName = String(receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag;
    sails.log.info('[BTCBatchReceiveByInWallet.setReceiveAddressUnlocked] detail : address ' + receiveObject.account[accountName].address);
    return AssetUtil.setReceiveAddressStatus(receiveObject.account[accountName].address, false);
  }

  markNotInProcess(account) {
    sails.log.debug('[BTCBatchReceiveByInWallet.markNotInProcess] start: address' + account.BTCAccount.address);
    return BatchUtil.markAccountNotInProcess(account.BTCAccount.address);
  }
  updateAssetTx(receiveObject) {
    sails.log.info('[BTCBatchReceiveByInWallet.updateAssetTx] start: userid ' + receiveObject.userid + ' assetname: ' + receiveObject.assetname + ' balance : ' + receiveObject.balance + ' txid: ' + receiveObject.txid);
    return TradeAssetUtil.updateAssetTx(receiveObject.txid, sails.config.asset.tx_confirmed);
  }
  updateAssetTxInRedis(assetTx, receiveObject) {
    sails.log.info('[BTCBatchReceiveByInWallet.updateAssetTxInRedis] start: usderid: ' + receiveObject.userid + ' txid: ' + receiveObject.txid + ' assetTx: ' + JSON.stringify(assetTx));
    TradeAssetUtil.addChangedInfoToMq(receiveObject.userid, null, null, null, null, null, null, null, assetTx);    
    return TradeAssetUtil.updateAssetTxInRedis(receiveObject.userid, receiveObject.txid, assetTx);
  }
  getReceiveObjectFromInWalletMQ() {
    //sails.log.info('[BTCBatchReceiveByInWallet.getReceiveObjectFromInWalletMQ] start mq name ' + sails.config.mq.inwallet_mq_btc );
    return BatchUtil.getFromMQ(sails.config.mq.inwallet_mq_btc, 10)
  }

  isConfirmed(receiveObject) {
    sails.log.info('[BTCBatchReceiveByInWallet.isConfirmed] start: txid ' + receiveObject.txid);
    return new Promise(async (resolve, reject) => {
      const trans = await BTCUtil.getrawtransaction(receiveObject.txid);
      if (trans && trans.confirmations && trans.confirmations > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

  }

  updateAssetHistoryInRedis(userid, assetHistory, assetHistoryDate) {
    sails.log.info('[BTCBatchReceiveByInWallet.updateAssetHistoryInRedis] start: userid' + userid + ' assetHistory:' + JSON.stringify(assetHistory) + ' assetHistoryDate:' + assetHistoryDate);
    return AssetUtil.updateAssetHistoryInRedis(userid, assetHistory, assetHistoryDate, sails.config.asset.assets_history_state_deposited_checked);
  }

  updateAssetHistoryChecked(id) {
    sails.log.info('[BTCBatchReceiveByInWallet.updateAssetHistoryChecked] start: id' + id);
    return AssetUtil.updateAssetHistory(id, sails.config.asset.assets_history_state_deposited_checked);
  }

  removeReceiveObjectFromInWalletMQ(id) {
    sails.log.info('[BTCBatchReceiveByInWallet.removeReceiveObjectFromInWalletMQ] start: id' + id);
    return BatchUtil.removeFromMQ(sails.config.mq.inwallet_mq_btc, id)
  }
}

module.exports = BTCBatchReceiveByInWallet;