
const CommonUtil = require('../utils/CommonUtil');
const SendConfirmProcessor = require('../classes/Send/SendConfirmProcessor');
const SendProcessor = require('../classes/Send/SendProcessor');
module.exports = {
      processSend: async function (batch) {
            sails.log.info('[WalletBatchSendService.processSend] start');
            while (true) {
                  const resp = await batch.getSendObjFromSendMQ();
                  if (resp && resp.message) {
                        const sendObject = JSON.parse(resp.message);
                        try {
                              const processor = new SendProcessor(sendObject, resp.id, batch)
                              await processor.execute();
                        } catch (exception) {
                              sails.log.error("[SendConfirmProcessor.execute] error ", exception);
                        }
                  } else {
                        await CommonUtil.sleep(sails.config.mq.no_data_sleep);
                  }
            }
      },
      processSendConfirm: async function (batch) {
            sails.log.info('[WalletBatchSendService.processSendConfirm] start');
            while (true) {
                  let resp = await batch.getSendObjFromSendConfrimMQ();
                  if (resp && resp.message) {
                        let sendObject = JSON.parse(resp.message);
                        try {
                              var processor = new SendConfirmProcessor(sendObject, resp.id, batch)
                              await processor.execute();
                        } catch (exception) {
                              sails.log.error("[SendConfirmProcessor.execute] error ", exception);
                        }
                  } else {
                        await CommonUtil.sleep(sails.config.mq.no_data_sleep);
                  }
            }
      },
}