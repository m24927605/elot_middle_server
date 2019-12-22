/**
 * ETH的轮询任务，全部作为callback注入WalletBatchReceiveService
 */

const ETHBlockComfirmation = require('../classes/ETH/ETHBlockComfirmation');
const ETHBatchReceiveByAccount = require('../classes/ETH/ETHBatchReceiveByAccount');
const ETHBatchReceiveByInWallet = require('../classes/ETH/ETHBatchReceiveByInWallet');
const ETHSendBatch = require('../classes/ETH/ETHSendBatch');
const ETHSendConfirmBatch = require('../classes/ETH/ETHSendConfirmBatch');
const ethSendBatch = new ETHSendBatch();
const ethSendConfirmBatch = new ETHSendConfirmBatch();
const ethBlockComfirmation = new ETHBlockComfirmation();
const ethBatchReceiveByAccount = new ETHBatchReceiveByAccount();
const ethBatchReceiveByInWallet = new ETHBatchReceiveByInWallet();

module.exports = {
	processReceiveByAccount: function () {
		sails.log.info('[WalletBatchETHService.processReceiveByAccount] start');
		WalletBatchReceiveService.processReceiveByAccount(ethBatchReceiveByAccount);
	},
	processRecevieByInWallet: function () {
		sails.log.info('[WalletBatchETHService.processRecevieByInWallet] start');
		WalletBatchReceiveService.processRecevieByInWallet(ethBatchReceiveByInWallet);
	},
	processBlockComfirmation: function () {
		sails.log.info('[WalletBatchETHService.processBlockComfirmation] start');
		WalletBatchReceiveService.processBlockComfirmation(ethBlockComfirmation);
	},
	processSend: function () {
		sails.log.info('[WalletBatchETHService.processSend] start');
		WalletBatchSendService.processSend(ethSendBatch);
	},
	processSendConfirm: function () {
		sails.log.info('[WalletBatchETHService.processSendConfirm] start');
		WalletBatchSendService.processSendConfirm(ethSendConfirmBatch);
	},
}