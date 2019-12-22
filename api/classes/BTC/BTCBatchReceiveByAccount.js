const BatchUtil = require('../../utils/BatchUtil');
const BTCUtil = require('../../utils/BTCUtil');
const AssetUtil = require('../../utils/AssetUtil');

class BTCBatchReceiveByAccount {
  constructor() {
    BTCBatchReceiveByAccount.instance = this;
  }
  getAddressFromAccount(account) {
    return account.BTCAccount.address;
  }
  getReceiveAddressStatus(receiveObject) {
    sails.log.info('[BTCBatchReceiveByAccount.getReceiveAddressStatus] start');
    return new Promise(async (resolve, reject) => {
      try {
        const accountName = String(receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag;
        const resp = await AssetUtil.getReceiveAddressStatus(receiveObject.account[accountName].address);
        sails.log.info('[BTCBatchReceiveByAccount.getReceiveAddressStatus] end : resp ' + resp);
        if (String(resp).toUpperCase() === String(sails.config.constant.true).toUpperCase())
          resolve(true);
        else
          resolve(false);
      } catch (error) {
        reject(error);
      }
    })
  }
  setReceiveAddressUnlocked(receiveObject) {
    sails.log.info('[BTCBatchReceiveByAccount.setReceiveAddressUnlocked] start ');
    const accountName = String(receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag;
    sails.log.info('[BTCBatchReceiveByAccount.setReceiveAddressUnlocked] detail : address ' + receiveObject.account[accountName].address);
    return AssetUtil.setReceiveAddressStatus(receiveObject.account[accountName].address, false);
  }
  setReceiveAddressLocked(receiveObject) {
    sails.log.info('[BTCBatchReceiveByAccount.setReceiveAddressLocked] start ');
    const accountName = String(receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag;
    sails.log.info('[BTCBatchReceiveByAccount.setReceiveAddressLocked] detail : address ' + receiveObject.account[accountName].address);
    return AssetUtil.setReceiveAddressStatus(receiveObject.account[accountName].address, true);
  }
  async checkInputData(receiveObject, mqid) {
    sails.log.info('[BTCBatchReceiveByAccount.checkInputData] start: receiveObject.userid:' + receiveObject.userid);
    if (!mqid) {
      sails.log.error('[BTCBatchReceiveByAccount.checkInputData] mqid check error', mqid);
      return false;
    }

    if (!receiveObject.timestamp) {
      sails.log.error('[BTCBatchReceiveByAccount.checkInputData] receiveObject.timestamp invalid', receiveObject.timestamp);
      return false;
    }

    if (!receiveObject.userid) {
      sails.log.error('[BTCBatchReceiveByAccount.checkInputData] receiveObject.userid invalid', receiveObject.userid);
      return false;
    }

    if (!receiveObject.assetname) {
      sails.log.error('[BTCBatchReceiveByAccount.checkInputData] receiveObject.assetname invalid', receiveObject.assetname);
      return false;
    }

    if (!receiveObject.account) {
      sails.log.error('[BTCBatchReceiveByAccount.checkInputData] receiveObject.account invalid', receiveObject.account);
      return false;
    }

    let validateRes;
    validateRes = await BTCUtil.validateaddress(receiveObject.account.BTCAccount.address)
    if (!validateRes) {
      sails.log.error('[BTCBatchReceiveByAccount.checkInputData] validateRes invalid', validateRes);
      return false;
    }
    sails.log.info('[BTCBatchReceiveByAccount.checkInputData] end: receiveObject check passed ,result : true ');
    return true;
  }

  getCurrentBlock() {
    sails.log.info('[BTCBatchReceiveByAccount.getCurrentBlock] start:');
    return WalletBTCService.getCurrentBlock();
  }
  markNotInProcess(account) {
    sails.log.info('[BTCBatchReceiveByAccount.markNotInProcess] start: address' + account.BTCAccount.address);
    return BatchUtil.markAccountNotInProcess(account.BTCAccount.address);
  }
  isOvertime(timestamp) {
    sails.log.info('[BTCBatchReceiveByAccount.isOvertime] start: timestamp ' + timestamp + ', time span: ' + (new Date().getTime() - parseInt(timestamp)));
    if (sails.config.mq.on_receive_ttl < new Date().getTime() - parseInt(timestamp)) {
      return true
    } else {
      return false;
    }
  }
  getReceiveObjectFromReceiveMQ() {
    //sails.log.info('[BTCBatchReceiveByAccount.getReceiveObjectFromReceiveMQ] start: mq name ' + sails.config.mq.receive_mq_btc);
    return BatchUtil.getFromMQ(sails.config.mq.receive_mq_btc, 10)
  }
  async getFee(fee) {
    return 0;
  }
  checkFee(fee) {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }
  getBalance(address) {
    sails.log.info('[BTCBatchReceiveByAccount.getBalance] start: address ' + address);
    return new Promise((resolve, reject) => {
      try {
        WalletBTCService.balance(address).then((balance) => {
          sails.log.info('[BTCBatchReceiveByAccount.getBalance] end  balance :' + balance + ' address: ' + address);
          return resolve(balance);
        });
      } catch (error) {
        reject(error);
      }
    })
  }

  checkBalance(balance) {
    sails.log.info('[BTCBatchReceiveByAccount.checkBalance] start: balance' + balance);
    if (balance >= sails.config.BTC.receiveThreshold) {
      return true;
    } else {
      return false;
    }

  }

  addReceiveObjectToConfirmMQ(receiveObject) {
    sails.log.info('[BTCBatchReceiveByAccount.addReceiveObjectToConfirmMQ] start: add to MQ:' + sails.config.mq.confirm_mq_btc);
    return BatchUtil.putToMQ(sails.config.mq.confirm_mq_btc, JSON.stringify(receiveObject));
  }

  removeReceiveObjectFromReceiveMQ(id) {
    sails.log.info('[BTCBatchReceiveByAccount.removeReceiveObjectFromReceiveMQ] start: remove mqid :' + id);
    return BatchUtil.removeFromMQ(sails.config.mq.receive_mq_btc, id);
  }
};

module.exports = BTCBatchReceiveByAccount;
