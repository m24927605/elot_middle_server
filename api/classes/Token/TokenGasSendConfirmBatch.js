let BatchUtil = require('../../utils/BatchUtil');
let TokenUtil = require('../../utils/TokenUtil');
let AssetUtil = require('../../utils/AssetUtil');

class TokenGasSendConfirmBatch {
  constructor() {
    TokenGasSendConfirmBatch.instance = this;
  }

  getSendObjFromSendConfrimMQ() {
    //sails.log.info('[TokenGasSendConfirmBatch.getSendObjFromSendConfrimMQ] start: MQName ' +  sails.config.mq.send_from_gas_tanker_confirm );
    return BatchUtil.getFromMQ(sails.config.mq.send_from_gas_tanker_confirm, 10)
  }

  isConfirmed(txid) {
    sails.log.info('[TokenGasSendConfirmBatch.isConfirmed] start: txid ' + txid);
    return new Promise(async (resolve, reject) => {
      if (!txid) {
        return reject(new Error('txid_null'));
      }
      let trans = await TokenUtil.getTransactionReceipt(txid);
      if (trans) {
        return resolve(true);
      } else {
        return resolve(false);
      }
    })
  }

  afterConfirmed(gasTankerObject) {
    sails.log.info('[TokenGasSendConfirmBatch.afterConfirmed] start: gasTankerObject ' + JSON.stringify(gasTankerObject));
    return new Promise(async (resolve, reject) => {
      try {
        let gasTankerTX = await AssetUtil.updateGasTankerTx(gasTankerObject.txid, sails.config.asset.tx_confirmed);
        await AssetUtil.updateGasTankerTXInRedis(gasTankerObject.txid, gasTankerTX);
        resolve(gasTankerTX);
      } catch (error) {
        reject(error);
      }
    });
  }

  async checkInputData(gasTankerObject, mqid) {
    sails.log.info('[TokenGasSendConfirmBatch.checkInputData] start: userid ' + gasTankerObject.userid);
    if (!mqid) {
      return false;
    }
    if (!gasTankerObject.timestamp) {
      return false;
    }
    if (!gasTankerObject.userid) {
      return false;
    }
    if (!gasTankerObject.assetname) {
      return false;
    }
    if (!gasTankerObject.address) {
      return false;
    }
    if (!gasTankerObject.size) {
      return false;
    }
    if (!gasTankerObject.txid) {
      return false;
    }
    let validateRes = await TokenUtil.validateaddress(gasTankerObject.address);
    if (!validateRes) {
      return false;
    }
    sails.log.info('[TokenGasSendConfirmBatch.checkInputData] end: resp true');
    return true;
  }

  removeGasTankerObjectFromConfirmMQ(id) {
    sails.log.info('[TokenGasSendConfirmBatch.removeGasTankerObjectFromConfirmMQ] start mqid: ' + id);
    return BatchUtil.removeFromMQ(sails.config.mq.send_from_gas_tanker_confirm, id);
  }
}
module.exports = TokenGasSendConfirmBatch;
