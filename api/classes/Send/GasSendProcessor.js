class GasSendProcessor {
    constructor(gasTankerObject, mqid, batch) {
        this.gasTankerObject = gasTankerObject;
        this.batch = batch;
        this.mqid = mqid;
    }

    execute() {
        return new Promise(async (resolved, reject) => {
            const checkParaRes = await this.batch.checkInputData(this.gasTankerObject, this.mqid);
            if (String(checkParaRes).toUpperCase() === String(sails.config.constant.false).toUpperCase()) {
                try {
                    await this.batch.removeGasTankerObjectFromMQ(this.mqid);
                } catch (exception) {
                    sails.log.error('[GasSendProcessor.execute] error batch.removeGasTankerObjectFromMQ ', exception);
                }
                return reject({ input_data_error: this.gasTankerObject, mqid: this.mqid });
            }

            let islocked;
            try {
                islocked = await this.batch.beforeSend(this.gasTankerObject);
            } catch (exception) {
                sails.log.error('[GasSendProcessor.execute] error batch.beforeSend ', exception);
                this.batch.removeGasTankerObjectFromMQ(this.mqid);
            }

            if (!islocked) {
                return resolved(islocked);
            }

            let txid;
            try {
                txid = await this.batch.sendToAddress(this.gasTankerObject.address, this.gasTankerObject.size);
            } catch (exception) {
                sails.log.error('[GasSendProcessor.execute] error batch.sendToAddress ', exception);
                this.batch.removeGasTankerObjectFromMQ(this.mqid);
            }

            if (txid) {
                this.gasTankerObject.txid = txid;
            } else {
                sails.log.error('[GasSendProcessor.execute] error txid null ');
                this.batch.removeGasTankerObjectFromMQ(this.mqid);
            }

            try {
                await this.batch.afterSend(this.gasTankerObject);
            } catch (exception) {
                sails.log.error('[GasSendProcessor.execute] error batch.afterSend ', exception);
                this.batch.removeGasTankerObjectFromMQ(this.mqid);
            }

            try {
                await this.batch.addGasTankerObjectToConfirmMQ(this.gasTankerObject);
            } catch (exception) {
                sails.log.error('[GasSendProcessor.execute] error batch.addConfirmSendMQ ', exception);
                this.batch.removeGasTankerObjectFromMQ(this.mqid);
            }

            try {
                await this.batch.removeGasTankerObjectFromMQ(this.mqid);
            } catch (exception) {
                sails.log.error('[GasSendProcessor.execute] error batch.removeGasTankerObjectFromMQ', exception);
            }
            resolved(txid);
        });
    }
}
module.exports = GasSendProcessor;