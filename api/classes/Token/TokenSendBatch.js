let BatchUtil = require('../../utils/BatchUtil');
let TokenUtil = require('../../utils/TokenUtil');
let AssetUtil = require('../../utils/AssetUtil');
let TradeAssetUtil = require('../../utils/TradeAssetUtil');
let TradeUpdateBalance = require('../Trade/TradeUpdateBalance');
let CommonUtil = require('../../utils/CommonUtil');
class TokenSendBatch {
  constructor() {
    TokenSendBatch.instance = this;
    this.index = 0;
    this.topic = null;
    this.startFlag = true;
  }
  getSendObjFromSendMQ() {
    // sails.log.info('[TokenSendBatch.getSendObjFromSendMQ] start sendMQName ' + sails.config.mq[sails.config.constant.send_mq_flag + String( sails.config.mq.tokens[this.index] ).toLowerCase()] );
    const sendMQName = sails.config.constant.send_mq_flag + String(sails.config.mq.tokens[this.index]).toLowerCase();
    this.index++;
    if (this.index == sails.config.mq.tokens.length) {
      this.index = 0;
    }
    this.topic = sails.config.mq[sendMQName];
    return BatchUtil.getFromMQ(this.topic, 10)
  }

  async checkInputData(sendObject, mqid) {
    sails.log.info('[TokenSendBatch.checkInputData] start: userid ' + sendObject.userid + ' mqid: ' + mqid);
    this.sendObject = sendObject;
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
    }

    let validateRes;
    validateRes = await TokenUtil.validateaddress(sendObject.address);
    if (!validateRes) {
      return false;
    }
    sails.log.info('[TokenSendBatch.checkInputData] end: response true ');
    return true;
  }

  updateAsset(userid, size) {
    sails.log.info('[TokenSendBatch.updateAsset] start: userid ' + userid + ' size: ' + size);
    const asset = {};
    asset.userid = userid;
    const assetAvailableName = String(this.sendObject.assetname).toLowerCase() + 'Available';
    asset[assetAvailableName] = size;
    return AssetUtil.updateAssetSend(userid, asset, assetAvailableName);
  }

  updateAssetInRedis(userid, asset) {
    sails.log.info('[TokenSendBatch.updateAssetInRedis] start: userid ' + userid + ' asset: ' + JSON.stringify(asset));
    return AssetUtil.updateAssetInRedis(userid, asset);
  }

  initAssetHistory(userid, size, txid) {
    sails.log.info('[TokenSendBatch.initAssetHistory] start: userid ' + userid + ' size: ' + size + ' txid: ' + txid);
    return AssetUtil.initAssetHistoryUnchecked(userid, this.sendObject.assetname, size, txid, sails.config.asset.assets_history_side_withdraw, sails.config.asset.assets_history_state_withdraw_unchecked);
  }

  initAssetHistoryInRedis(userid, assetHistory, assetHistoryDate) {
    sails.log.info('[TokenSendBatch.initAssetHistoryInRedis] start userid :' + userid + ' assetHistory: ' + JSON.stringify(assetHistory) + ' assetHistoryDate: ' + assetHistoryDate);
    return AssetUtil.updateAssetHistoryInRedis(userid, assetHistory, assetHistoryDate, sails.config.asset.assets_history_state_withdraw_unchecked);
  }
  sendToAddress(address, size) {
    sails.log.info('[TokenSendBatch.sendToAddress] start address :' + address + ' size: ' + size);
    return new Promise(async (resolve, reject) => {
      try {
        const gasPrice = TokenUtil.getSendGasPriceByGwei(sails.config[String(this.sendObject.assetname).toUpperCase()].sendTransferFee);
        const pk = sails.config[String(this.sendObject.assetname).toUpperCase()].outPK;
        const to = address;
        const amount = size - sails.config[String(this.sendObject.assetname).toUpperCase()].sendThreshold;
        const nounce_redis = await AssetUtil.getNounce(sails.config[String(this.sendObject.assetname).toUpperCase()].outAddress);
        const txid = TokenUtil.transferWithTxCount(to, pk, gasPrice, amount, this.sendObject.assetname, parseInt(nounce_redis));
        resolve(txid);
      } catch (error) {
        reject(error);
      }
    });
  }
  beforeSend(sendObject) {
    sails.log.info('[TokenSendBatch.beforeSend] start : outAddress ' + sails.config[String(this.sendObject.assetname).toUpperCase()].outAddress);
    const outAddress = sails.config[String(this.sendObject.assetname).toUpperCase()].outAddress;
    return new Promise(async (resolve, reject) => {
      try {
        let nounce_redis = await AssetUtil.getNounce(outAddress);
        let nounce_web3 = await TokenUtil.getTransactionCount(outAddress);
        if (this.startFlag || nounce_redis == null || nounce_redis == undefined || nounce_web3 > nounce_redis) {
          this.startFlag = false;
          await AssetUtil.setNounce(outAddress, nounce_web3);
        }
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }
  afterSend(sendObject) {
    sails.log.info('[TokenSendBatch.afterSend] start: sendObject ' + JSON.stringify(sendObject));
    return new Promise(async (resolve, reject) => {
      try {
        const updateBalanceProcessor = new TradeUpdateBalance(sendObject.userid, sendObject.assetname, sails.config.trader.business_withdraw, sendObject.size, { msg: 'withdraw' });
        updateBalanceProcessor.updateBalance();

        const assetTx = await TradeAssetUtil.submitAssetTx(sendObject.userid, sendObject.assetname, sendObject.size, sendObject.txid, sails.config.asset.assets_side_withdraw);
        await TradeAssetUtil.updateAssetTxInRedis(sendObject.userid, sendObject.txid, assetTx);
        TradeAssetUtil.addChangedInfoToMq(sendObject.userid, null, null, null, null, null, null, null, assetTx);
        let nounce_redis = await AssetUtil.getNounce(sails.config[String(this.sendObject.assetname).toUpperCase()].outAddress);
        nounce_redis++;
        const ret = await AssetUtil.setNounce(sails.config[String(this.sendObject.assetname).toUpperCase()].outAddress, nounce_redis);
        resolve(ret);
      } catch (error) {
        reject(error);
      }
    });
  }
  removeSendObjectFromMQ(id) {
    sails.log.info('[TokenSendBatch.removeSendObjectFromMQ] start mq topic: ' + this.topic);
    return BatchUtil.removeFromMQ(this.topic, id);
  }

  addConfirmSendMQ(sendObject) {
    sails.log.info('[TokenSendBatch.addConfirmSendMQ] start: mq name ' + sails.config.constant.send_mq_flag + String(this.sendObject.assetname).toLowerCase() + sails.config.constant.confirm_flag);
    const sendConfirmMQName = sails.config.constant.send_mq_flag + String(this.sendObject.assetname).toLowerCase() + sails.config.constant.confirm_flag;
    sails.log.info('[TokenSendBatch.addConfirmSendMQ] end: topic ' + sails.config.mq[sendConfirmMQName]);
    return BatchUtil.putToMQ(sails.config.mq[sendConfirmMQName], JSON.stringify(sendObject));
  }
}

module.exports = TokenSendBatch;
