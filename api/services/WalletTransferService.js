let CommonUtil = require('../utils/CommonUtil');

module.exports = {
    token: function (to, pk, gasPrice, amount, tokenName) {
        sails.log.info('[WalletTransferService.token] start: to: ' + to + ' amount: ' + amount + ' pk: ***' + ' gasPrice: ' + gasPrice + ' tokenName: ' + tokenName);
        var promise;
        try {
            promise = WalletTokenService.transferWithBalanceCheck(to, pk, gasPrice, amount, tokenName);
        } catch (exceptions) {
            sails.log.error("token: function(to,pk,gasPrice,amount,tokenName)  to: " + to + " gasPrice: " + gasPrice + " amount: " + amount + " tokenName: " + tokenName);
            sails.log.error(exceptions);
        }
        return promise;
    },
    eth: function (to, pk, gasPrice, amount) {
        sails.log.info('[WalletTransferService.eth] start: to: ' + to + ' amount: ' + amount + ' pk:*** ' + ' gasPrice: ' + gasPrice);
        var promise;
        try {
            promise = WalletETHService.transferWithBalanceCheck(to, pk, gasPrice, amount);
        } catch (exceptions) {
            sails.log.error("eth: function(to,pk,gasPrice,amount)  to: " + to + " gasPrice: " + gasPrice + " amount: " + amount)
            sails.log.error(exceptions);
        }
        return promise;
    },
    btc: function (to, amountToSend, pk, transactionFee) {
        sails.log.info('[WalletTransferService.btc] start: to: ' + to + ' amountToSend: ' + amountToSend + ' pk:*** ' + ' transactionFee: ' + transactionFee);
        var promise;
        try {
            promise = WalletBTCService.transferWithBalanceCheck(to, amountToSend, pk, transactionFee);
        } catch (exceptions) {
            sails.log.error("btc: function(to,amountToSend,pk,transactionFee)  to: " + to + " amountToSend: " + amountToSend + " pk:*** " + " transactionFee: " + transactionFee);
            sails.log.error(exceptions);
        }
        return promise;
    },
    ltc: function (to, amountToSend, pk, transactionFee) {
        sails.log.info('[WalletTransferService.ltc] start: to: ' + to + ' amountToSend: ' + amountToSend + ' pk:*** ' + ' transactionFee: ' + transactionFee);
        var promise;
        try {
            promise = WalletLTCService.transferWithBalanceCheck(to, amountToSend, pk, transactionFee);
        } catch (exceptions) {
            sails.log.error("btc: function(to,amountToSend,pk,transactionFee)  to: " + to + " amountToSend: " + amountToSend + " pk:*** " + " transactionFee: " + transactionFee);
            sails.log.error(exceptions);
        }
        return promise;
    },
    qrcode: function (data) {
        sails.log.info('[WalletTransferService.qrcode] start: data: ' + data);
        return CommonUtil.qrcode(data);
    },
    getTicker: function () {
        return CommonUtil.getTicker();
    },
    getPrices: function () {
        return CommonUtil.getPrices();
    }
}