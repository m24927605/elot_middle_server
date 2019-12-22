const BatchUtil = require('../../utils/BatchUtil');
const ETHUtil = require('../../utils/ETHUtil');
const AssetUtil = require('../../utils/AssetUtil');
const TradeAssetUtil = require('../../utils/TradeAssetUtil');
const TradeUpdateBalance = require('../Trade/TradeUpdateBalance');
const CommonUtil = require('../../utils/CommonUtil');
class ETHSendBatch {
  constructor() {
    ETHSendBatch.instance = this;
    this.startFlag = true;
  }

  getSendObjFromSendMQ() {
    //sails.log.info('[ETHSendBatch.getSendObjFromSendMQ] start : sendMQName '+sails.config.mq.send_mq_eth );
    return BatchUtil.getFromMQ(sails.config.mq.send_mq_eth, 10)
  }

  async checkInputData(sendObject, mqid) {
    sails.log.info('[ETHSendBatch.checkInputData] start: userid ' + sendObject.userid + ' sendObject: ' + JSON.stringify(sendObject));
    if (!mqid) {
      return false;
    }
    if (!sendObject.timestamp) {
      return false;
    }
    if (!sendObject.userid) {
      return false;
    }
    if (!sendObject.assetname) {
      return false;
    }
    if (!sendObject.address) {
      return false;
    }
    if (!sendObject.size) {
      return false;
    } else {
      sendObject.size = CommonUtil.trimDecimal(sendObject.size, sails.config.asset.asset_decimal);
    }

    let validateRes;
    validateRes = await ETHUtil.validateaddress(sendObject.address)
    if (!validateRes) {
      return false;
    }
    sails.log.info('[ETHSendBatch.checkInputData] end: resp true');
    return true;
  }

  updateAsset(userid, size) {
    sails.log.info('[ETHSendBatch.updateAsset] start: userid ' + userid + ' size: ' + size);
    const asset = {};
    asset.userid = userid;
    asset.ethAvailable = size;
    return AssetUtil.updateAssetSend(userid, asset, 'ethAvailable');
  }

  updateAssetInRedis(userid, asset) {
    sails.log.info('[ETHSendBatch.updateAssetInRedis] start : userid ' + userid + ' asset: ' + asset);
    return AssetUtil.updateAssetInRedis(userid, asset);
  }

  initAssetHistory(userid, size, txid) {
    sails.log.info('[ETHSendBatch.initAssetHistory] start userid :' + userid + ' size: ' + size + ' txid: ' + txid);
    return AssetUtil.initAssetHistoryUnchecked(userid, sails.config.asset.assets_eth_name, size, txid, sails.config.asset.assets_history_side_withdraw, sails.config.asset.assets_history_state_withdraw_unchecked);
  }

  initAssetHistoryInRedis(userid, assetHistory, assetHistoryDate) {
    sails.log.info('[ETHSendBatch.initAssetHistoryInRedis] start userid :' + userid + ' assetHistory: ' + JSON.stringify(assetHistory) + ' assetHistoryDate: ' + assetHistoryDate);
    return AssetUtil.updateAssetHistoryInRedis(userid, assetHistory, assetHistoryDate, sails.config.asset.assets_history_state_withdraw_unchecked);
  }

  sendToAddress(address, size) {
    sails.log.info('[ETHSendBatch.sendToAddress] start address :' + address + ' size: ' + size);
    return new Promise(async (resolve, reject) => {
      try {
        const gasPrice = ETHUtil.getSendGasPriceByGwei();
        const pk = sails.config.ETH.outPK;
        const to = address;
        const amount = size;
        const nounce_redis = await AssetUtil.getNounce(sails.config.ETH.outAddress);
        const txid = await WalletETHService.transferBatchWithBalanceCheck(to, pk, gasPrice, amount, parseInt(nounce_redis));
        resolve(txid);
      } catch (error) {
        reject(error);
      }
    });
  }
  beforeSend(sendObject) {
    sails.log.info('[ETHSendBatch.beforeSend] start : address ' + sails.config.ETH.outAddress);
    return new Promise(async (resolve, reject) => {
      try {
        const nounce_redis = await AssetUtil.getNounce(sails.config.ETH.outAddress);
        const nounce_web3 = await ETHUtil.getTransactionCount(sails.config.ETH.outAddress);
        if (this.startFlag || nounce_redis == null || nounce_redis == undefined || nounce_web3 > nounce_redis) {
          this.startFlag = false;
          await AssetUtil.setNounce(sails.config.ETH.outAddress, nounce_web3);
        }
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }
  afterSend(sendObject) {
    sails.log.info('[ETHSendBatch.afterSend] start: sendObject ' + JSON.stringify(sendObject));
    return new Promise(async (resolve, reject) => {
      try {
        const updateBalanceProcessor = new TradeUpdateBalance(sendObject.userid, sendObject.assetname, sails.config.trader.business_withdraw, sendObject.size, { msg: 'withdraw' });
        updateBalanceProcessor.updateBalance();

        let assetTx = await TradeAssetUtil.submitAssetTx(sendObject.userid, sendObject.assetname, sendObject.size, sendObject.txid, sails.config.asset.assets_side_withdraw);
        TradeAssetUtil.addChangedInfoToMq(sendObject.userid, null, null, null, null, null, null, null, assetTx);
        await TradeAssetUtil.updateAssetTxInRedis(sendObject.userid, sendObject.txid, assetTx);
        let nounce_redis = await AssetUtil.getNounce(sails.config.ETH.outAddress);
        nounce_redis++;
        let ret = await AssetUtil.setNounce(sails.config.ETH.outAddress, nounce_redis);
        resolve(ret);
      } catch (error) {
        reject(error);
      }
    });
  }

  removeSendObjectFromMQ(id) {
    sails.log.info('[ETHSendBatch.removeSendObjectFromMQ] start mqid: ' + id);
    return BatchUtil.removeFromMQ(sails.config.mq.send_mq_eth, id);
  }

  addConfirmSendMQ(sendObject) {
    sails.log.info('[ETHSendBatch.addConfirmSendMQ] start: mq name ' + sails.config.mq.inwallet_mq_eth);
    return BatchUtil.putToMQ(sails.config.mq.send_mq_eth_confirm, JSON.stringify(sendObject));
  }
}
module.exports = ETHSendBatch;
