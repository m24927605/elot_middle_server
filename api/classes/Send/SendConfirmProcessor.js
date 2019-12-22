const CommonUtil = require('../../utils/CommonUtil');

class SendConfirmProcessor {
    constructor(sendObject, mqid, batch) {
        this.sendObject = sendObject;
        this.batch = batch;
        this.mqid = mqid;
    }

    execute() {
        return new Promise(async (resolved, reject) => {
            const checkParaRes = await this.batch.checkInputData(this.sendObject, this.mqid);
            if (String(checkParaRes).toUpperCase() === String(sails.config.constant.false).toUpperCase()) {
                try {
                    await this.batch.removeSendObjectFromMQ(this.mqid);
                } catch (exception) {
                    sails.log.error('[SendConfirmProcessor.execute] error batch.removeSendObjectFromMQ ', exception);
                }
                return reject({ input_data_error: this.sendObject, mqid: this.mqid });
            }

            let confirmed;
            try {
                confirmed = await this.batch.isConfirmed(this.sendObject.txid);
            } catch (exception) {
                sails.log.error('[SendConfirmProcessor.execute] error batch.isConfirmed ', exception);
                this.batch.removeSendObjectFromMQ(this.mqid);
            }

            if (!confirmed) {
                return resolved(confirmed);
            }

            try {
                await this.batch.afterConfirmed(this.sendObject);
            } catch (exception) {
                sails.log.error('[SendConfirmProcessor.execute] error batch.afterConfirmed ', exception);
                this.batch.removeSendObjectFromMQ(this.mqid);
            }

            let assetHistory;
            try {
                assetHistory = await this.batch.updateAssetHistoryChecked(this.sendObject.assetHistoryId);
            } catch (exception) {
                sails.log.error("batch.updateAssetHistoryChecked", exception);
                this.batch.removeSendObjectFromMQ(this.mqid);
            }

            try {
                await this.batch.updateAssetHistoryInRedis(this.sendObject.userid, assetHistory, CommonUtil.getNowFormatDate());
            } catch (exception) {
                sails.log.error("batch.updateAssetHistoryChecked", exception);
                this.batch.removeSendObjectFromMQ(this.mqid);
            }

            try {
                await this.batch.removeSendObjectFromMQ(this.mqid);
            } catch (exception) {
                sails.log.error('batch.removeSendObjectFromMQ', exception);
                this.batch.removeSendObjectFromMQ(this.mqid);
            }
            return resolved(confirmed);
        });
    }
}
module.exports = SendConfirmProcessor;