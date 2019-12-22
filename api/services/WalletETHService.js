let ETHUtil = require('../utils/ETHUtil');
module.exports = {
  transferBatchWithBalanceCheck: function (to, pk, gasPrice, amount, nounce) {
    sails.log.info('[WalletETHService.transferBatchWithBalanceCheck] start: to ' + to + ' pk :***  gasPrice :' + gasPrice + ' pk: ' + pk + ' amount: ' + amount + ' nounce: ' + nounce);
    return new Promise((resolve, reject) => {
      ETHUtil.getBalance(ETHUtil.getAddressFromPk(pk)).then((balance) => {
        if (balance < amount) {
          reject({ error: "balance_not_enough", balance: balance, amount: amount });
        } else {
          ETHUtil.transferBatch(ETHUtil.getAddressFromPk(pk), to, pk, gasPrice, amount, nounce).then((txid) => {
            resolve(txid);
          }).catch((exception) => {
            reject(exception);
          });
        }
      });
    });
  },
  transferWithBalanceCheck: function (to, pk, gasPrice, amount) {
    sails.log.info('[WalletETHService.transferWithBalanceCheck] start: to ' + to + ' pk :***  gasPrice :' + gasPrice + ' amount: ' + amount);
    return new Promise((resolve, reject) => {
      ETHUtil.getBalance(ETHUtil.getAddressFromPk(pk)).then((balance) => {
        if (balance < amount) {
          reject({ error: "balance_not_enough", balance: balance, amount: amount });
        } else {
          ETHUtil.transfer(ETHUtil.getAddressFromPk(pk), to, pk, gasPrice, amount).then((txid) => {
            resolve(txid);
          }).catch((exception) => {
            reject(exception);
          });
        }
      });
    });
  },
  balance:async function (address) {
    sails.log.info('[WalletETHService.balance] start: address ' + address);
    var result;
    try {
      result =await ETHUtil.getBalance(address);
      console.log('ether balance',result)
    } catch (exception) {
      sails.log.error("WalletETHService.balance", address);
      sails.log.error(exception);
    }
    return result;
  },
  getTransaction: function (txid) {
    return;
  },
  getCurrentBlock: function () {
    sails.log.info('[WalletETHService.getCurrentBlock] start');
    return ETHUtil.getCurrentBlock();
  },
  validateAddress: function (address) {
    sails.log.info('[WalletETHService.validateAddress] start : address ' + address);
    return ETHUtil.validateaddress(address);
  },
  ranTransaction: function (rawTransactionData) {
    sails.log.info('[WalletETHService.ranTransaction] start : rawTransactionData ' + rawTransactionData);
    return ETHUtil.sendTransaction(rawTransactionData);
  }

}