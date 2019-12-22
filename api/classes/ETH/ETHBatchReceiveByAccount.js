const BatchUtil = require('../../utils/BatchUtil');
const ETHUtil = require('../../utils/ETHUtil');
const AssetUtil = require('../../utils/AssetUtil');
class ETHBatchReceiveByAccount {
  constructor() {
    ETHBatchReceiveByAccount.instance = this;
  }
  getAddressFromAccount(account) {
    return account.ETHAccount.address;
  }
  async checkInputData(receiveObject, mqid) {
    sails.log.info('[ETHBatchReceiveByAccount.checkInputData] start: receiveObject.userid:' + receiveObject.userid + '      ' + JSON.stringify(receiveObject.account.ETHAccount.address));
    if (!mqid) {
      return false;
    }

    if (!receiveObject.timestamp) {
      return false;
    }

    if (!receiveObject.userid) {
      return false;
    }

    if (!receiveObject.assetname) {
      return false;
    }

    if (!receiveObject.account) {
      return false;
    }

    if (!receiveObject.account.ETHAccount) {
      return false;
    }

    let validateRes;
    validateRes = await ETHUtil.validateaddress(receiveObject.account.ETHAccount.address)

    if (!validateRes) {
      return false;
    }
    return true;
  }
  getCurrentBlock() {
    sails.log.info('[ETHBatchReceiveByAccount.getCurrentBlock] start:');
    return WalletETHService.getCurrentBlock();
  }
  markNotInProcess(account) {
    sails.log.info('[ETHBatchReceiveByAccount.markNotInProcess] start: address' + account.ETHAccount.address);
    return BatchUtil.markAccountNotInProcess(account.ETHAccount.address);
  }
  isOvertime(timestamp) {
    sails.log.info('[ETHBatchReceiveByAccount.isOvertime] start: timestamp ' + timestamp + ', time span: ' + (new Date().getTime() - parseInt(timestamp)));
    if (sails.config.mq.on_receive_ttl < new Date().getTime() - parseInt(timestamp)) {
      return true
    } else {
      return false;
    }
  }
  getReceiveObjectFromReceiveMQ() {
    return BatchUtil.getFromMQ(sails.config.mq.receive_mq_eth, 10)
  }
  async getFee() {
    return 0;
  }
  checkFee(fee) {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }
  getBalance(address) {
    sails.log.info('[ETHBatchReceiveByAccount.getBalance] start: address ' + address);
    return new Promise((resolve, reject) => {
      try {
        WalletETHService.balance(address).then((balance) => {
          sails.log.info('[ETHBatchReceiveByAccount.getBalance] end: balance ' + balance);
          return resolve(balance);
        });
      } catch (error) {
        reject(error);
      }
    })
  }
  getReceiveAddressStatus(receiveObject) {
    sails.log.info('[ETHBatchReceiveByAccount.getReceiveAddressStatus] start');
    return new Promise(async (resolve, reject) => {
      try {
        let accountName = String(receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag;
        let resp = await AssetUtil.getReceiveAddressStatus(receiveObject.account[accountName].address);
        sails.log.info('[ETHBatchReceiveByAccount.getReceiveAddressStatus] end : resp ' + resp);
        if (String(resp).toUpperCase() === String(sails.config.constant.true).toUpperCase()) {
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (error) {
        reject(error);
      }
    });
  }
  setReceiveAddressLocked(receiveObject) {
    sails.log.info('[ETHBatchReceiveByAccount.setReceiveAddressLocked] start ');
    let accountName = String(receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag;
    sails.log.info('[ETHBatchReceiveByAccount.setReceiveAddressLocked] detail : address ' + receiveObject.account[accountName].address);
    return AssetUtil.setReceiveAddressStatus(receiveObject.account[accountName].address, true);
  }
  checkBalance(balance) {
    sails.log.info('[ETHBatchReceiveByAccount.checkBalance] start: balance ' + balance);
    if (balance >= sails.config.ETH.receiveThreshold) {
      return true;
    } else {
      return false;
    }
  }
  addReceiveObjectToConfirmMQ(receiveObject) {
    sails.log.info('[ETHBatchReceiveByAccount.addReceiveObjectToConfirmMQ] start: mqname ' + sails.config.mq.confirm_mq_eth);
    return BatchUtil.putToMQ(sails.config.mq.confirm_mq_eth, JSON.stringify(receiveObject));
  }
  removeReceiveObjectFromReceiveMQ(id) {
    sails.log.info('[ETHBatchReceiveByAccount.removeReceiveObjectFromReceiveMQ] start: mqid ' + id);
    return BatchUtil.removeFromMQ(sails.config.mq.receive_mq_eth, id);
  }
};
module.exports = ETHBatchReceiveByAccount;