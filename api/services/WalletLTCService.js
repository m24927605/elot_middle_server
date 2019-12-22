/**
 * 封装的RPC调用bitcoind的api
   调用LTCUtil一起完成BTC的账号生成和转账，查询等任务
 */

let LTCUtil = require('../utils/LTCUtil');

module.exports = {
  transferWithBalanceCheck: function (toAddress, amountToSend, pk, transactionFee) {
    return new Promise((resolve, reject) => {
      WalletBTCService.balance(LTCUtil.addressFromPK(pk)).then((balance) => {
        if (amountToSend > balance) {
          reject({ error: "balance_not_enough" });
        } else {
          LTCUtil.transfer(toAddress, amountToSend, pk, transactionFee)
            .then((result) => {
              resolve(result);
            }).catch((exception) => {
              reject(exception);
            });
        }
      });
    });
  },

  //获取余额
  balance: function (address) {
    return LTCUtil.getbalance(address);
  },

  getTransaction: function (txid) {
    return LTCUtil.getrawtransaction(txid);
  },

  getCurrentBlock: function () {
    return LTCUtil.getCurrentBlock();
  },

  validateAddress: function (address) {
    return LTCUtil.validateaddress(address);
  },

}




