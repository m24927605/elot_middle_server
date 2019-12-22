/**
 * 处理消息队列任务任务，全部作为callback注入WalletBatchReceiveService
 */
const BTCBlockComfirmation = require('../classes/BTC/BTCBlockComfirmation');
const BTCBatchReceiveByAccount = require('../classes/BTC/BTCBatchReceiveByAccount');
const BTCBatchReceiveByInWallet = require('../classes/BTC/BTCBatchReceiveByInWallet');
const BTCSendBatch = require('../classes/BTC/BTCSendBatch');
const BTCSendConfirmBatch = require('../classes/BTC/BTCSendConfirmBatch');
const btcSendBatch = new BTCSendBatch();
const btcSendConfirmBatch = new BTCSendConfirmBatch();
const btcBatchReceiveByInWallet = new BTCBatchReceiveByInWallet();
const btcBlockComfirmation = new BTCBlockComfirmation();
const btcBatchReceiveByAccount = new BTCBatchReceiveByAccount();
module.exports = {
    processReceiveByAccount: function () {
        sails.log.info('[WalletBatchBTCService.processReceiveByAccount] start');
        WalletBatchReceiveService.processReceiveByAccount(btcBatchReceiveByAccount);
    },
    processRecevieByInWallet: function () {
        sails.log.info('[WalletBatchBTCService.processRecevieByInWallet] start');
        WalletBatchReceiveService.processRecevieByInWallet(btcBatchReceiveByInWallet);
    },
    processBlockComfirmation: function () {
        sails.log.info('[WalletBatchBTCService.processBlockComfirmation] start');
        WalletBatchReceiveService.processBlockComfirmation(btcBlockComfirmation);
    },
    processSend: function () {
        sails.log.info('[WalletBatchBTCService.processSend] start');
        WalletBatchSendService.processSend(btcSendBatch);
    },
    processSendConfirm: function () {
        sails.log.info('[WalletBatchBTCService.processSendConfirm] start');
        WalletBatchSendService.processSendConfirm(btcSendConfirmBatch);
    },
}