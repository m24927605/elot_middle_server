const PreSendImp = require('../classes/PreSend/PreSendImp');
const PreSendConfirmImp = require('../classes/PreSend/PreSendConfirmImp')
const PreSendProcessor = require('../classes/PreSend/PreSendProcessor');
const PreSendConfirmProcessor = require('../classes/PreSend/PreSendConfirmProcessor');
const CommonUtil = require('../utils/CommonUtil');
module.exports = {
      processPresend: async () => {
            sails.log.info('[WalletBatchPresendService.processPresend] start');
            while (true) {
                  const resp = await PreSendImp.getSendObjFromSendMQ();
                  if (resp && resp.message) {
                        const sendObject = JSON.parse(resp.message);
                        try {
                              const processor = new PreSendProcessor(sendObject, resp.id)
                              await processor.execute();
                        } catch (exception) {
                              sails.log.error("[PreSendProcessor.execute] error ", exception);
                        }
                  } else {
                        await CommonUtil.sleep(sails.config.mq.no_data_sleep);
                  }
            }
      },
      processPresendConfirm: async () => {
            sails.log.info('[WalletBatchPresendService.processPresendConfirm] start');
            while (true) {
                  const resp = await PreSendConfirmImp.getSendObjFromPresendConfirmMQ();
                  if (resp && resp.message) {
                        const sendObject = JSON.parse(resp.message);
                        try {
                              const processor = new PreSendConfirmProcessor(sendObject, resp.id)
                              await processor.execute();
                        } catch (exception) {
                              sails.log.error("[PreSendConfirmProcessor.execute] error ", exception);
                        }
                  } else {
                        await CommonUtil.sleep(sails.config.mq.no_data_sleep);
                  }
            }
      },
}