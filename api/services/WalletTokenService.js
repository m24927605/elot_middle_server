let ETHUtil = require('../utils/ETHUtil');
let TokenUtil = require('../utils/TokenUtil');
let CommonUtil = require('../utils/CommonUtil');
module.exports = {
  transferWithBalanceCheck: function (to, pk, gasPrice, amount, tokenName) {
    sails.log.info('[WalletSendService.transferWithBalanceCheck] start: to ' + to + ' pk:*** gasPrice: ' + gasPrice + ' amount: ' + amount + ' tokenName: ' + tokenName);
    return TokenUtil.transferWithBalanceCheck(to, pk, gasPrice, amount, tokenName)
  },
  balance: function (address, tokenName) {
    sails.log.info('[WalletSendService.balance] start: address ' + address + ' tokenName: ' + tokenName);
    return new Promise((resolve, reject) => {
      const contractAddress = sails.config[String(tokenName).toUpperCase()].contract;
      const decimal = sails.config[String(tokenName).toUpperCase()].decimal;
      TokenUtil.getBalance(address, contractAddress).then((balance) => {
        console.log('ether balance',balance);
        return resolve(CommonUtil.divide(balance, decimal).toString());
      }).catch((exception) => {
        return reject(exception);
      });
    })
  },
  getTransaction: function (txid) {
    sails.log.info("[WalletSendService.getTransaction] start");
    return;
  },
  getCurrentBlock: function () {
    sails.log.info("[WalletSendService.getCurrentBlock] start ");
    return TokenUtil.getCurrentBlock();
  },
  validateAddress: function (address) {
    sails.log.info("[WalletSendService.validateAddress] start : validateAddress " + address);
    return TokenUtil.validateaddress(address);
  }
}