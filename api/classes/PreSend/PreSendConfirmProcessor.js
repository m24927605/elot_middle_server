const preSendConfirmUtil = require('./PreSendConfirmImp');
class PreSendConfirmProcessor {
    constructor(sendObject, mqid) {
        this.sendObject = sendObject;
        this.mqid = mqid;
    }

    execute() {
        return new Promise(async (resolved, reject) => {
            const checkParaRes = await preSendConfirmUtil.checkInputData(this.sendObject, this.mqid);
            if (String(checkParaRes).toUpperCase() === String(sails.config.constant.false).toUpperCase()) {
                try {
                    await preSendConfirmUtil.removeSendObjectFromPresendConfirmMQ(this.mqid);
                } catch (exception) {
                    sails.log.error('[PreSendConfirmProcessor.execute] error preSendConfirmUtil.removeSendObjectFromPresendConfirmMQ ', exception);
                }
                return reject({ input_data_error: this.sendObject, mqid: this.mqid });
            }

            const isOvertime = await preSendConfirmUtil.isOvertime(this.sendObject.timestamp, this.sendObject.key);
            if (isOvertime) {
                try {
                    await preSendConfirmUtil.removeSendObjectFromPresendConfirmMQ(this.mqid);
                } catch (exception) {
                    sails.log.error('[PreSendConfirmProcessor.execute] error batch.isOvertime ', exception);
                }
            }

            try {
                const isConfirm = await preSendConfirmUtil.checkEmailConfirm(this.sendObject.key);
                console.log('### isConfirm ##',isConfirm);
                if (String(isConfirm).toUpperCase() === String(sails.config.constant.false).toUpperCase()) {
                    return resolved(isConfirm);
                }
            } catch (error) {
                sails.log.error('[PreSendConfirmProcessor.execute] error preSendConfirmUtil.sendEmail ', error);
                preSendConfirmUtil.removeSendObjectFromPresendConfirmMQ(this.mqid);
            }

            try {
                await preSendConfirmUtil.addSendObject2SendMQ(this.sendObject);
            } catch (error) {
                sails.log.error('[PreSendConfirmProcessor.execute] error preSendConfirmUtil.addSendObject2SendMQ ', error);
                preSendConfirmUtil.removeSendObjectFromPresendConfirmMQ(this.mqid);
            }

            try {
                await preSendConfirmUtil.removeSendObjectFromPresendConfirmMQ(this.mqid);
            } catch (error) {
                sails.log.error('[PreSendConfirmProcessor.execute] error preSendConfirmUtil.removeSendObjectFromPresendConfirmMQ ', error);
            }

            resolved(this.sendObject);
        });
    }
}
module.exports = PreSendConfirmProcessor;