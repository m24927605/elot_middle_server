let BatchUtil = require('../../utils/BatchUtil');
let TokenUtil = require('../../utils/TokenUtil');
let AssetUtil = require('../../utils/AssetUtil');

class TokenBatchReceiveByAccount {
  constructor() {
    TokenBatchReceiveByAccount.instance = this;
    this.index = 0;
    this.receiveObject = null;
  }
  getAddressFromAccount(account) {
    //sails.log.info('[TokenBatchReceiveByAccount.getAddressFromAccount] start ' + String(this.receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag);
    const assetAccountName = String(this.receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag;
    return account[assetAccountName].address;
  }
  async checkInputData(receiveObject, mqid) {
    sails.log.info('[TokenBatchReceiveByAccount.checkInputData] start: mqid:' + mqid + ' userid: ' + receiveObject.userid);
    this.receiveObject = receiveObject;
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
    const assetAccountName = String(this.receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag;
    if (!receiveObject.account[assetAccountName]) {
      return false;
    }
    let validateRes;
    receiveObject.address = receiveObject.account[assetAccountName].address;
    validateRes = await TokenUtil.validateaddress(receiveObject.address);
    if (!validateRes) {
      return false;
    }
    return true;
  }
  getCurrentBlock() {
    sails.log.info('[TokenBatchReceiveByAccount.getCurrentBlock] start');
    return WalletTokenService.getCurrentBlock();
  }
  markNotInProcess(account) {
    sails.log.info('[TokenBatchReceiveByAccount.markNotInProcess] start : address : ' + account[String(this.receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag].address);
    const assetAccountName = String(this.receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag;
    return BatchUtil.markAccountNotInProcess(account[assetAccountName].address);
  }
  isOvertime(timestamp) {
    sails.log.info('[TokenBatchReceiveByAccount.isOvertime] start : timestamp ' + timestamp + ', time span: ' + (new Date().getTime() - parseInt(timestamp)));
    if (sails.config.mq.on_receive_ttl < new Date().getTime() - parseInt(timestamp)) {
      return true
    } else {
      return false;
    }
  }
  getReceiveObjectFromReceiveMQ() {
    //sails.log.info('[TokenBatchReceiveByAccount.getReceiveObjectFromReceiveMQ] start : '  + sails.config.constant.receive_mq_flag+String( sails.config.mq.tokens[this.index] ).toLowerCase());
    const receiveMqName = sails.config.constant.receive_mq_flag + String(sails.config.mq.tokens[this.index]).toLowerCase();
    this.index++;
    if (this.index == sails.config.mq.tokens.length) {
      this.index = 0;
    }
    return BatchUtil.getFromMQ(sails.config.mq[receiveMqName], 10)
  }
  getBalance(address) {
    sails.log.info('[TokenBatchReceiveByAccount.getBalance] start : address ' + address);
    return new Promise(async (resolve, reject) => {
      let balance;
      try {
        balance = await WalletTokenService.balance(address, this.receiveObject.assetname);
      } catch (exception) {
        reject(exception);
      }
      sails.log.info('[TokenBatchReceiveByAccount.getBalance] end  : assetname ' + this.receiveObject.assetname + ' balance ' + balance);
      return resolve(balance);
    });
  }
  getFee(receiveObject) {
    sails.log.info('[TokenBatchReceiveByAccount.getFee] start: address ' + this.getAddressFromAccount(receiveObject.account));
    return new Promise((resolve, reject) => {
      try {
        WalletETHService.balance(this.getAddressFromAccount(receiveObject.account)).then((balance) => {
          sails.log.info('[TokenBatchReceiveByAccount.getFee] end: balance ' + balance);
          return resolve(balance);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  checkFee(fee) {
    sails.log.info('[TokenBatchReceiveByAccount.checkFee] start: fee ' + fee);
    return new Promise(async (resolve, reject) => {
      if (fee >= sails.config[String(this.receiveObject.assetname).toUpperCase()].sendTransferFee) {
        TokenUtil.addTokenFeeApplyInRedis(this.getAddressFromAccount(this.receiveObject.account), false);
        return resolve(true);
      } else {
        await TokenUtil.processFeeApply(this.getAddressFromAccount(this.receiveObject.account), this.receiveObject.userid, this.receiveObject.assetname);
        return resolve(false);
      }
    })

  }
  async getReceiveAddressStatus(receiveObject) {
    sails.log.info('[TokenBatchReceiveByAccount.getReceiveAddressStatus] start');
    return new Promise(async (resolve, reject) => {
      try {
        let accountName = String(receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag;
        let resp = await AssetUtil.getReceiveAddressStatus(receiveObject.account[accountName].address);
        sails.log.info('[TokenBatchReceiveByAccount.getReceiveAddressStatus] end : resp ' + resp);
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
    sails.log.info('[TokenBatchReceiveByAccount.setReceiveAddressLocked] start ');
    let accountName = String(receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag;
    sails.log.info('[TokenBatchReceiveByAccount.setReceiveAddressLocked] detail : address ' + receiveObject.account[accountName].address);
    return AssetUtil.setReceiveAddressStatus(receiveObject.account[accountName].address, true);
  }
  checkBalance(balance) {
    sails.log.info('[TokenBatchReceiveByAccount.checkBalance] start : balance ' + balance);
    if (balance >= sails.config[String(this.receiveObject.assetname).toUpperCase()].receiveThreshold) {
      return true;
    } else {
      return false;
    }
  }
  addReceiveObjectToConfirmMQ(receiveObject) {
    sails.log.info('[TokenBatchReceiveByAccount.addReceiveObjectToConfirmMQ] start : confirmMqName ' + sails.config.constant.confirm_mq_flag + String(this.receiveObject.assetname).toLowerCase());
    const confirmMqName = sails.config.constant.confirm_mq_flag + String(this.receiveObject.assetname).toLowerCase();
    return BatchUtil.putToMQ(sails.config.mq[confirmMqName], JSON.stringify(receiveObject));
  }
  removeReceiveObjectFromReceiveMQ(id) {
    sails.log.info('[TokenBatchReceiveByAccount.removeReceiveObjectFromReceiveMQ] start : receiveMqName ' + sails.config.constant.receive_mq_flag + String(this.receiveObject.assetname).toLowerCase());
    const receiveMqName = sails.config.constant.receive_mq_flag + String(this.receiveObject.assetname).toLowerCase();
    return BatchUtil.removeFromMQ(sails.config.mq[receiveMqName], id);
  }
};
module.exports = TokenBatchReceiveByAccount;
