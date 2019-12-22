const CommonUtil = require('../../utils/CommonUtil');
class SendProcessor {
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
                    sails.log.error('[SendProcessor.execute] error batch.removeSendObjectFromMQ ', exception);
                }
                return reject({ input_data_error: this.sendObject, mqid: this.mqid });
            }

            let islocked;
            try {
                islocked = await this.batch.beforeSend(this.sendObject);
            } catch (exception) {
                sails.log.error('[SendProcessor.execute] error batch.beforeSend ', exception);
                this.batch.removeSendObjectFromMQ(this.mqid);
            }

            if (!islocked) {
                return resolved(islocked);
            }

            let txid;
            try {
                txid = await this.batch.sendToAddress(this.sendObject.address, this.sendObject.size);
            } catch (exception) {
                sails.log.error('[SendProcessor.execute] error batch.sendToAddress ', exception);
                this.batch.removeSendObjectFromMQ(this.mqid);
            }
            if (txid) {
                this.sendObject.txid = txid;
            } else {
                sails.log.error('[SendProcessor.execute] error txid null ');
                this.batch.removeSendObjectFromMQ(this.mqid);
            }

            try {
                await this.batch.afterSend(this.sendObject);
            } catch (exception) {
                sails.log.error('[SendProcessor.execute] error batch.afterSend ', exception);
                this.batch.removeSendObjectFromMQ(this.mqid);
            }

            let updateAsset;
            try {
                updateAsset = await this.batch.updateAsset(this.sendObject.userid, this.sendObject.size);
            } catch (exception) {
                sails.log.error('[SendProcessor.execute] error batch.updateAsset ', exception);
                this.batch.removeSendObjectFromMQ(this.mqid);
            }

            try {
                await this.batch.updateAssetInRedis(this.sendObject.userid, updateAsset);
            } catch (exception) {
                sails.log.error('[SendProcessor.execute] error batch.updateAssetInRedis ', exception);
                this.batch.removeSendObjectFromMQ(this.mqid);
            }

            let initAssetHistory;
            try {
                initAssetHistory = await this.batch.initAssetHistory(this.sendObject.userid, this.sendObject.size, txid);
            } catch (exception) {
                sails.log.error('[SendProcessor.execute] error batch.initAssetHistory ', exception);
                this.batch.removeSendObjectFromMQ(this.mqid);
            }

            this.sendObject.assetHistoryId = initAssetHistory.id;
            try {
                await this.batch.initAssetHistoryInRedis(this.sendObject.userid, initAssetHistory, CommonUtil.getNowFormatDate());
            } catch (exception) {
                sails.log.error('[SendProcessor.execute] error batch.initAssetHistoryInRedis ', exception);
                this.batch.removeSendObjectFromMQ(this.mqid);
            }

            try {
                await this.batch.addConfirmSendMQ(this.sendObject);
            } catch (exception) {
                sails.log.error('[SendProcessor.execute] error batch.addConfirmSendMQ ', exception);
                this.batch.removeSendObjectFromMQ(this.mqid);
            }

            try {
                await this.batch.removeSendObjectFromMQ(this.mqid);
            } catch (exception) {
                sails.log.error('batch.removeSendObjectFromMQ', exception);
            }
            resolved(txid);
        });
    }
}
module.exports = SendProcessor;