class GasSendConfirmProcessor {
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
                    await this.batch.removeGasTankerObjectFromConfirmMQ(this.mqid);
                } catch (exception) {
                    sails.log.error('[GasSendConfirmProcessor.execute] error batch.removeGasTankerObjectFromConfirmMQ ', exception);
                }
                return reject({ input_data_error: this.gasTankerObject, mqid: this.mqid });
            }

            let confirmed;
            try {
                confirmed = await this.batch.isConfirmed(this.gasTankerObject.txid);
            } catch (exception) {
                sails.log.error('[GasSendConfirmProcessor.execute] error batch.isConfirmed ', exception);
                this.batch.removeGasTankerObjectFromConfirmMQ(this.mqid);
            }

            if (!confirmed) {
                return resolved(confirmed);
            }

            try {
                await this.batch.afterConfirmed(this.gasTankerObject);
            } catch (exception) {
                sails.log.error('[GasSendConfirmProcessor.execute] error batch.afterConfirmed ', exception);
                this.batch.removeGasTankerObjectFromConfirmMQ(this.mqid);
            }

            try {
                await this.batch.removeGasTankerObjectFromConfirmMQ(this.mqid);
            } catch (exception) {
                sails.log.error('GasSendConfirmProcessor.removeGasTankerObjectFromConfirmMQ', exception);
                this.batch.removeGasTankerObjectFromConfirmMQ(this.mqid);
            }
            return resolved(confirmed);
        });
    }
}
module.exports = GasSendConfirmProcessor;