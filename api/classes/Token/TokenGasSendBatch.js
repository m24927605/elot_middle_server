let BatchUtil = require('../../utils/BatchUtil');
let TokenUtil = require('../../utils/TokenUtil');
let AssetUtil = require('../../utils/AssetUtil');
class TokenGasSendBatch {
  constructor() {
    TokenGasSendBatch.instance = this;
  }

  getGasTankerObjectFromMQ() {
    //sails.log.info('[TokenGasSendBatch.getGasTankerObjectFromMQ] start MQName ' + sails.config.mq.send_from_gas_tanker );
    return BatchUtil.getFromMQ(sails.config.mq.send_from_gas_tanker, 10)
  }

  async checkInputData(gasTankerObject, mqid) {
    sails.log.info('[TokenGasSendBatch.checkInputData] start: userid ' + gasTankerObject.userid + ' mqid: ' + mqid);
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
    const validateRes = await TokenUtil.validateaddress(gasTankerObject.address);
    if (!validateRes) {
      return false;
    }
    sails.log.info('[TokenGasSendBatch.checkInputData] end: response true ');
    return true;
  }

  sendToAddress(address, size) {
    sails.log.info('[TokenGasSendBatch.sendToAddress] start address :' + address + ' size: ' + size);
    return new Promise(async (resolve, reject) => {
      try {
        const gasPrice = TokenUtil.getGasTankerGasPriceByGwei();
        const pk = sails.config.globals.gas_tanker_privatekey;
        const to = address;
        const amount = size;
        const nounce_redis = await AssetUtil.getNounce(sails.config.globals.gas_tanker_address);
        const txid = await WalletETHService.transferBatchWithBalanceCheck(to, pk, gasPrice, amount, parseInt(nounce_redis));
        resolve(txid);
      } catch (error) {
        reject(error);
      }
    });
  }

  beforeSend(gasTankerObject) {
    sails.log.info('[TokenGasSendBatch.beforeSend] start : gasTankerObject ' + JSON.stringify(gasTankerObject));
    return new Promise(async (resolve, reject) => {
      try {
        const nounce_redis = await AssetUtil.getNounce(sails.config.globals.gas_tanker_address);
        const nounce_web3 = await TokenUtil.getTransactionCount(sails.config.globals.gas_tanker_address);
        if (nounce_redis == null || nounce_redis == undefined || nounce_web3 > nounce_redis) {
          await AssetUtil.setNounce(sails.config.globals.gas_tanker_address, nounce_web3);
        }
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  afterSend(gasTankerObject) {
    sails.log.info('[TokenGasSendBatch.afterSend] start: gasTankerObject ' + JSON.stringify(gasTankerObject));
    return new Promise(async (resolve, reject) => {
      try {
        let gasTankerTX = await AssetUtil.createGasTankerTX(gasTankerObject.userid, gasTankerObject.assetname, gasTankerObject.size, sails.config.asset.tx_submitted, gasTankerObject.txid);
        await AssetUtil.updateGasTankerTXInRedis(gasTankerObject.txid, gasTankerTX);
        let nounce_redis = await AssetUtil.getNounce(sails.config.globals.gas_tanker_address);
        nounce_redis++;
        let ret = await AssetUtil.setNounce(sails.config.globals.gas_tanker_address, nounce_redis);
        resolve(ret);
      } catch (error) {
        reject(error);
      }
    });
  }

  removeGasTankerObjectFromMQ(id) {
    sails.log.info('[TokenGasSendBatch.removeGasTankerObjectFromMQ] start mqid: ' + id);
    return BatchUtil.removeFromMQ(sails.config.mq.send_from_gas_tanker, id);
  }

  addGasTankerObjectToConfirmMQ(gasTankerObject) {
    sails.log.info('[TokenGasSendBatch.addGasTankerObjectToConfirmMQ] start: mq name ' + sails.config.mq.send_from_gas_tanker_confirm);
    return BatchUtil.putToMQ(sails.config.mq.send_from_gas_tanker_confirm, JSON.stringify(gasTankerObject));
  }
}

module.exports = TokenGasSendBatch;
