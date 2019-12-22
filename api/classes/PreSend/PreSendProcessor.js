const preSendUtil = require('./PreSendImp');
class PreSendProcessor {
    constructor(sendObject, mqid) {
        this.sendObject = sendObject;
        this.mqid = mqid;
    }

    execute() {
        return new Promise(async (resolved, reject) => {
            const checkParaRes = await preSendUtil.checkInputData(this.sendObject, this.mqid);
            if (String(checkParaRes).toUpperCase() === String(sails.config.constant.false).toUpperCase()) {
                try {
                    await preSendUtil.removeSendObjectFromMQ(this.mqid);
                } catch (exception) {
                    sails.log.error('[PreSendProcessor.execute] error preSendUtil.removeSendObjectFromMQ ', exception);
                }
                return reject({ input_data_error: this.sendObject, mqid: this.mqid });
            }

            try {
                const isPass = await preSendUtil.checkUser(this.sendObject.userid);
                if (!isPass) {
                    preSendUtil.removeSendObjectFromMQ(this.mqid);
                    return reject({error:sails.config.constant.user_risk_check_error});
                }
            } catch (error) {
                sails.log.error('[PreSendProcessor.execute] error preSendUtil.checkUser ', error);
                await preSendUtil.removeSendObjectFromMQ(this.mqid);
                return reject(error);
            }

            try {
                this.sendObject = await preSendUtil.sendEmail(this.sendObject);
            } catch (error) {
                sails.log.error('[PreSendProcessor.execute] error preSendUtil.sendEmail ', error);
                await preSendUtil.removeSendObjectFromMQ(this.mqid);
                return reject(error);
            }
           
            try {
                await preSendUtil.add2PreSendConfirmMQ(this.sendObject);
            } catch (error) {
                sails.log.error('[PreSendProcessor.execute] error preSendUtil.add2PreSendConfirmMQ ', error);
                await preSendUtil.removeSendObjectFromMQ(this.mqid);
                return reject(error);
            }

            try {
                await preSendUtil.removeSendObjectFromMQ(this.mqid);
            } catch (error) {
                sails.log.error('[PreSendProcessor.execute] error preSendUtil.removeSendObjectFromMQ ', error);
            }
    
            resolved(this.sendObject);
        });
    }
}
module.exports = PreSendProcessor;