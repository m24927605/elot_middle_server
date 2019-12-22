let BatchUtil = require('../../utils/BatchUtil');
let TokenUtil = require('../../utils/TokenUtil');
let AssetUtil = require('../../utils/AssetUtil');
let TradeAssetUtil = require('../../utils/TradeAssetUtil');
class TokenBatchReceiveByInWallet {
  constructor() {
    TokenBatchReceiveByInWallet.instance = this;
    this.receiveObject = null;
    this.index = 0;
  }

  async checkInputData(receiveObject, mqid) {
    sails.log.info('[TokenBatchReceiveByInWallet.checkInputData] start : userid' + receiveObject.userid + ' mqid: ' + mqid);
    this.receiveObject = receiveObject;
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
    const assetAccountName = String(receiveObject.assetname).toUpperCase() + 'Account';
    if (!receiveObject.account[assetAccountName]) {
      return false;
    }
    validateRes = await TokenUtil.validateaddress(receiveObject.account[assetAccountName].address);
    if (!validateRes) {
      return false;
    }
    sails.log.info('[TokenBatchReceiveByInWallet.checkInputData] end : response :' + true);
    return true;
  }
  markNotInProcess(account) {
    sails.log.debug('[TokenBatchReceiveByInWallet.markNotInProcess] start : address : ' + account[String(this.receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag].address);
    const assetAccountName = String(this.receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag;
    return BatchUtil.markAccountNotInProcess(account[assetAccountName].address);
  }
  getReceiveObjectFromInWalletMQ() {
    // sails.log.info('[TokenBlockComfirmation.getReceiveObjectFromInWalletMQ] start : inwalletMQName '+ sails.config.constant.inwallet_mq_flag + String( sails.config.mq.tokens[this.index] ).toLowerCase());
    const inwalletMQName = sails.config.constant.inwallet_mq_flag + String(sails.config.mq.tokens[this.index]).toLowerCase();
    this.index++;
    if (this.index == sails.config.mq.tokens.length) {
      this.index = 0;
    }
    return BatchUtil.getFromMQ(sails.config.mq[inwalletMQName], 10)
  }
  updateAssetTx(receiveObject) {
    sails.log.info('[TokenBlockComfirmation.updateAssetTx] start: userid ' + receiveObject.userid + ' assetname: ' + receiveObject.assetname + ' balance : ' + receiveObject.balance + ' txid: ' + receiveObject.txid);
    return TradeAssetUtil.updateAssetTx(receiveObject.txid, sails.config.asset.tx_confirmed);
  }
  updateAssetTxInRedis(assetTx, receiveObject) {
    sails.log.info('[TokenBlockComfirmation.updateAssetTxInRedis] start: usderid: ' + receiveObject.userid + ' txid: ' + receiveObject.txid + ' assetTx: ' + JSON.stringify(assetTx));
    TradeAssetUtil.addChangedInfoToMq(receiveObject.userid, null, null, null, null, null, null, null, assetTx);        
    return TradeAssetUtil.updateAssetTxInRedis(receiveObject.userid, receiveObject.txid, assetTx);
  }
  isConfirmed(receiveObject) {
    sails.log.info('[TokenBatchReceiveByInWallet.isConfirmed] start : txid ' + receiveObject.txid);
    return new Promise(async resolve => {
      const trans = await TokenUtil.getTransactionReceipt(receiveObject.txid);
      if (trans) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }
  setReceiveAddressUnlocked(receiveObject) {
    sails.log.info('[TokenBatchReceiveByInWallet.setReceiveAddressUnlocked] start: ' + String(receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag);
    let accountName = String(receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag;
    sails.log.info('[TokenBatchReceiveByInWallet.setReceiveAddressUnlocked] detail : address ' + receiveObject.account[accountName].address);
    return AssetUtil.setReceiveAddressStatus(receiveObject.account[accountName].address, false);
  }
  updateAssetHistoryInRedis(userid, assetHistory, assetHistoryDate) {
    sails.log.info('[TokenBatchReceiveByInWallet.initAssetHistoryInRedis] start: userid ' + userid + ' assetHistory: ' + JSON.stringify(assetHistory) + ' assetHistoryDate:' + assetHistoryDate);
    return AssetUtil.updateAssetHistoryInRedis(userid, assetHistory, assetHistoryDate, sails.config.asset.assets_history_state_deposited_checked);
  }
  updateAssetHistoryChecked(id) {
    sails.log.info('[TokenBlockComfirmation.updateAssetHistoryChecked] start: id ' + id);
    return AssetUtil.updateAssetHistory(id, sails.config.asset.assets_history_state_deposited_checked);
  }
  removeReceiveObjectFromInWalletMQ(id) {
    sails.log.info('[TokenBlockComfirmation.removeReceiveObjectFromInWalletMQ] start inwalletMQName ' + sails.config.constant.inwallet_mq_flag + String(this.receiveObject.assetname).toLowerCase());
    const inwalletMQName = sails.config.constant.inwallet_mq_flag + String(this.receiveObject.assetname).toLowerCase();
    return BatchUtil.removeFromMQ(sails.config.mq[inwalletMQName], id)
  }
}
module.exports = TokenBatchReceiveByInWallet;