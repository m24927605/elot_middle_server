/**
 * 处理消息队列任务任务，全部作为callback注入WalletBatchReceiveService
 */
var TokenBlockComfirmation = require('../classes/Token/TokenBlockComfirmation');
var TokenBatchReceiveByAccount = require('../classes/Token/TokenBatchReceiveByAccount');
var TokenBatchReceiveByInWallet = require('../classes/Token/TokenBatchReceiveByInWallet');
var TokenSendBatch = require('../classes/Token/TokenSendBatch');
var TokenSendConfirmBatch = require('../classes/Token/TokenSendConfirmBatch');
const tokenSendBatch = new TokenSendBatch();
const tokenSendConfirmBatch = new TokenSendConfirmBatch();
const tokenBatchReceiveByInWallet = new TokenBatchReceiveByInWallet();
const tokenBlockComfirmation = new TokenBlockComfirmation();
const tokenBatchReceiveByAccount = new TokenBatchReceiveByAccount();
module.exports = {
    processReceiveByAccount: function () {
        sails.log.info('[WalletBatchTokenService.processReceiveByAccount] start');
        WalletBatchReceiveService.processReceiveByAccount(tokenBatchReceiveByAccount);
    },
    processRecevieByInWallet: function () {
        sails.log.info('[WalletBatchTokenService.processRecevieByInWallet] start');
        WalletBatchReceiveService.processRecevieByInWallet(tokenBatchReceiveByInWallet);
    },
    processBlockComfirmation: function () {
        sails.log.info('[WalletBatchTokenService.processBlockComfirmation] start');
        WalletBatchReceiveService.processBlockComfirmation(tokenBlockComfirmation);
    },
    processSend: function () {
        sails.log.info('[WalletBatchTokenService.processSend] start');
        WalletBatchSendService.processSend(tokenSendBatch);
    },
    processSendConfirm: function () {
        sails.log.info('[WalletBatchTokenService.processSendConfirm] start');
        WalletBatchSendService.processSendConfirm(tokenSendConfirmBatch);
    },
}