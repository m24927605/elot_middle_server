const CommonUtil = require('../utils/CommonUtil');
const ReceiveByAccountProcesser = require('../classes/Receive/ReceiveByAccountProcesser');
const ReceiveBlockComfirmationProcessor = require('../classes/Receive/ReceiveBlockComfirmationProcessor');
const ReceiveByInWalletProcessor = require('../classes/Receive/ReceiveByInWalletProcessor');
module.exports = {
  processReceiveByAccount: async function (batch) {
    sails.log.info('[WalletBatchReceiveService.processReceiveByAccount] start');
    while (true) {
      const resp = await batch.getReceiveObjectFromReceiveMQ();
      if (resp && resp.message) {
        const receiveObject = JSON.parse(resp.message);
        try {
          const processor = new ReceiveByAccountProcesser(receiveObject, resp.id, batch)
          await processor.execute();
        } catch (exception) {
          sails.log.error("ReceiveByAccountProcesser.execute", exception);
        }
      } else {
        await CommonUtil.sleep(sails.config.mq.no_data_sleep);
      }
    }
  },
  processBlockComfirmation: async function (batch) {
    sails.log.info('[WalletBatchReceiveService.processBlockComfirmation] start');
    while (true) {
      const resp = await batch.getReceiveObjFromConfrimMQ();
      if (resp && resp.message) {
        const receiveObject = JSON.parse(resp.message);
        try {
          const processor = new ReceiveBlockComfirmationProcessor(receiveObject, resp.id, batch);
          await processor.execute();
        } catch (exception) {
          sails.log.error('ReceiveBlockComfirmationProcessor.execute', exception);
        }
      } else {
        await CommonUtil.sleep(sails.config.mq.no_data_sleep);
      }
    }
  },
  processRecevieByInWallet: async function (batch) {
    sails.log.info('[WalletBatchReceiveService.processRecevieByInWallet] start');
    while (true) {
      const resp = await batch.getReceiveObjectFromInWalletMQ();
      if (resp && resp.message) {
        const receiveObject = JSON.parse(resp.message);
        try {
          const processor = new ReceiveByInWalletProcessor(receiveObject, resp.id, batch);
          await processor.execute();
        } catch (exception) {
          sails.log.error('ReceiveByInWalletProcessor.execute', exception);
        }
      } else {
        await CommonUtil.sleep(sails.config.mq.no_data_sleep);
      }
    }
  }
}