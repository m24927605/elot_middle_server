const BatchUtil = require('../utils/BatchUtil');

module.exports = {
  addReceiveObjectToReceiveMQ: async function (receiveObject) {
    sails.log.info("[WalletReceiveService.addReceiveObjectToReceiveMQ] start : receiveObject.userid ", receiveObject.userid);
    let assetsName = sails.config.constant.asset_flag + String(receiveObject.assetname).toLowerCase() + sails.config.constant.name_flag;
    var assetAccountName = String(receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag;
    let receiveMQToken = sails.config.constant.receive_mq_flag + String(receiveObject.assetname).toLowerCase();
    if (receiveObject.assetname == sails.config.asset.assets_eth_name) {
      BatchUtil.markAccountNotInProcess(receiveObject.account.ETHAccount.address);
      var check = await BatchUtil.checkAccountProcessState(receiveObject.account.ETHAccount.address);
      sails.log.info("[WalletReceiveService.addReceiveObjectToReceiveMQ] detail : check result: ", check);
      if (!check || String(check).toUpperCase() === String(sails.config.constant.false).toUpperCase()) {
        //BatchUtil.markAccountInProcess(receiveObject.account.ETHAccount.address);
        BatchUtil.putToMQ(sails.config.mq.receive_mq_eth, JSON.stringify(receiveObject))
          .then((result) => {
            sails.log.info("[WalletReceiveService.addReceiveObjectToReceiveMQ] end : mqid ", result);
          });
      }
    } else if (receiveObject.assetname === sails.config.asset.assets_btc_name) {
      let check = await BatchUtil.checkAccountProcessState(receiveObject.account.BTCAccount.address);
      sails.log.info("[WalletReceiveService.addReceiveObjectToReceiveMQ] detail : check result: ", check);
      if (!check || String(check).toUpperCase() === String(sails.config.constant.false).toUpperCase()) {
        BatchUtil.markAccountInProcess(receiveObject.account.BTCAccount.address);
        BatchUtil.putToMQ(sails.config.mq.receive_mq_btc, JSON.stringify(receiveObject)).then((result) => {
          sails.log.info("[WalletReceiveService.addReceiveObjectToReceiveMQ] end : mqid ", result);
        });
      }
    } else if (sails.config.asset[assetsName]) {
      let check = await BatchUtil.checkAccountProcessState(receiveObject.account[assetAccountName].address);
      if (!check || String(check).toUpperCase() === String(sails.config.constant.false).toUpperCase()) {
        BatchUtil.markAccountInProcess(receiveObject.account[assetAccountName].address);
        BatchUtil.putToMQ(sails.config.mq[receiveMQToken], JSON.stringify(receiveObject))
          .then((result) => {
            sails.log.info("[WalletReceiveService.addReceiveObjectToReceiveMQ] end : mqid ", result);
          });
      }
    }
  },
  run: function () {
    sails.log.info("[WalletReceiveService.run]: start");
    WalletReceiveService.runBTC();
    WalletReceiveService.runETH();
    WalletReceiveService.runToken();
  },
  runBTC: function () {
    sails.log.info("[WalletReceiveService.runBTC]: start");
    WalletBatchBTCService.processRecevieByInWallet();
    WalletBatchBTCService.processReceiveByAccount();
    WalletBatchBTCService.processBlockComfirmation();
  },
  runETH: function () {
    sails.log.info("[WalletReceiveService.runETH]: start");
    WalletBatchETHService.processRecevieByInWallet();
    WalletBatchETHService.processReceiveByAccount();
    WalletBatchETHService.processBlockComfirmation();
  },
  runToken: function () {
    sails.log.info("[WalletReceiveService.runToken]: start");
    WalletBatchTokenService.processRecevieByInWallet();
    WalletBatchTokenService.processReceiveByAccount();
    WalletBatchTokenService.processBlockComfirmation();
  }
}