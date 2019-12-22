let BTCUtil = require('../utils/BTCUtil');

module.exports = {
  transferWithBalanceCheck: function (toAddress, amountToSend, pk, transactionFee) {
    sails.log.info('[WalletBTCService.transferWithBalanceCheck] start: toAddress ' + toAddress + ' amountToSend: ' + amountToSend + ' privateKey: ' + pk + ' transactionFee: ' + transactionFee);
    return new Promise((resolve, reject) => {
      WalletBTCService.balance(BTCUtil.addressFromPK(pk)).then((balance) => {
        if (amountToSend > balance) {
          reject({ error: sails.config.constant.balance_not_enough });
        } else {
          BTCUtil.transfer(toAddress, amountToSend, pk, transactionFee).then((result) => {
            resolve(result);
          }).catch((exception) => {
            reject(exception);
          });
        }
      });
    });
  },
  balance: function (address) {
    sails.log.info('[WalletBTCService.balance] start: address ' + address);
    return BTCUtil.getbalance(address);
  },
  getTransaction: function (txid) {
    sails.log.info('[WalletBTCService.getTransaction] start: txid ' + txid);
    return BTCUtil.getrawtransaction(txid);
  },
  getCurrentBlock: function () {
    sails.log.info('[WalletBTCService.getCurrentBlock] start ');
    return BTCUtil.getCurrentBlock();
  },
  validateAddress: function (address) {
    sails.log.info('[WalletBTCService.validateAddress] start address' + address);
    return BTCUtil.validateaddress(address);
  }
}




