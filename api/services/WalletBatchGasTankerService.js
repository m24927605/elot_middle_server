const CommonUtil = require('../utils/CommonUtil');
const GasSendConfirmProcessor = require('../classes/Send/GasSendConfirmProcessor');
const GasSendProcessor = require('../classes/Send/GasSendProcessor');
module.exports = {
      processGasSend: async function (batch) {
            sails.log.info('[WalletBatchGasTankerService.processGasSend] start');
            while (true) {
                  let resp = await batch.getGasTankerObjectFromMQ();
                  if (resp && resp.message) {
                        let gasTankerObject = JSON.parse(resp.message);
                        try {
                              var processor = new GasSendProcessor(gasTankerObject, resp.id, batch)
                              await processor.execute();
                        } catch (exception) {
                              sails.log.error("[WalletBatchGasTankerService.processGasSend] [GasSendProcessor.execute] error ", exception);
                        }
                  } else {
                        await CommonUtil.sleep(sails.config.mq.no_data_sleep);
                  }
            }
      },
      processGasSendConfirm: async function (batch) {
            sails.log.info('[WalletBatchGasTankerService.processGasSendConfirm] start');
            while (true) {
                  let resp = await batch.getSendObjFromSendConfrimMQ();
                  if (resp && resp.message) {
                        let gasTankerObject = JSON.parse(resp.message);
                        try {
                              var processor = new GasSendConfirmProcessor(gasTankerObject, resp.id, batch)
                              await processor.execute();
                        } catch (exception) {
                              sails.log.error("[WalletBatchGasTankerService.processGasSendConfirm] [GasSendConfirmProcessor.execute] error ", exception);
                        }
                  } else {
                        await CommonUtil.sleep(sails.config.mq.no_data_sleep);
                  }
            }
      },
}