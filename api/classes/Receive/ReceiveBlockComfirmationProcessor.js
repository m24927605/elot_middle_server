let CommonUtil = require('../../utils/CommonUtil');

class ReceiveBlockComfirmationProcessor {
    constructor(receiveObject, mqid, batch) {
        this.receiveObject = receiveObject;
        this.batch = batch;
        this.mqid = mqid;
    }

    execute() {
        return new Promise(async (resolve, reject) => {
            const checkParaRes = await this.batch.checkInputData(this.receiveObject, this.mqid);
            if (String(checkParaRes).toUpperCase() === String(sails.config.constant.false).toUpperCase()) {
                try {
                    await this.batch.removeReceiveObjectFromConfirmMQ(this.mqid);
                } catch (exception) {
                    sails.log.error('[ReceiveBlockComfirmationProcessor.execute]: batch.checkInputData error  ', exception);
                }
                return reject({ input_data_error: this.receiveObject, mqid: this.mqid });
            }
            let currentBlock;
            try {
                currentBlock = await this.batch.getCurrentBlock();
            } catch (exception) {
                sails.log.error('[ReceiveBlockComfirmationProcessor.execute]: batch.getCurrentBlock() error ', exception);
                return reject(exception);
            }
            const isconfirmed = await this.batch.isConfirm(this.receiveObject.blockNumber, currentBlock, this.receiveObject, this.mqid);
            if (!isconfirmed) {
                return resolve(isconfirmed);
            }
            this.receiveObject.assetHistoryDate = CommonUtil.getNowFormatDate();

            let txid;
            try {
                txid = await this.batch.sendToInWallet(this.batch.getAccount(this.receiveObject.account), this.receiveObject.balance);
            } catch (exception) {
                sails.log.error("[ReceiveBlockComfirmationProcessor.execute]: error batch.sendToInWallet ", exception);
                this.batch.removeReceiveObjectFromConfirmMQ(this.mqid);
                return reject(exception);
            }
            this.receiveObject.txid = txid;
            let initAssetHistory;
            try {
                initAssetHistory = await this.batch.initAssetHistory(this.receiveObject.userid, this.receiveObject.balance, txid);
            } catch (exception) {
                sails.log.error("[ReceiveBlockComfirmationProcessor.execute] error: batch.initAssetHistory ", exception);
                this.batch.removeReceiveObjectFromConfirmMQ(this.mqid);
                return reject(exception);
            }
            this.receiveObject.assetHistory = initAssetHistory;
            try {
                await this.batch.initAssetHistoryInRedis(this.receiveObject.userid, initAssetHistory, this.receiveObject.assetHistoryDate);
            } catch (exception) {
                sails.log.error("[ReceiveBlockComfirmationProcessor.execute] error:batch.initAssetHistoryInRedis", exception);
                this.batch.removeReceiveObjectFromConfirmMQ(this.mqid);
                return reject(exception);
            }
            let updateAsset;
            try {
                updateAsset = await this.batch.updateAsset(this.receiveObject.userid, this.receiveObject.balance);
            } catch (exception) {
                sails.log.error("[ReceiveBlockComfirmationProcessor.execute] error:batch.updateAsset", exception);
                this.batch.removeReceiveObjectFromConfirmMQ(this.mqid);
                return reject(exception);
            }
            try {
                await this.batch.updateAssetInRedis(this.receiveObject.userid, updateAsset);
            } catch (exception) {
                sails.log.error("[ReceiveBlockComfirmationProcessor.execute] error:batch.updateAssetInRedis", exception);
                this.batch.removeReceiveObjectFromConfirmMQ(this.mqid);
                return reject(exception);
            }
            let assetTx;
            try {
                assetTx = await this.batch.createAssetTx(this.receiveObject);
            } catch (exception) {
                sails.log.error("[ReceiveBlockComfirmationProcessor.execute] error:batch.createAssetTx", exception);
                this.batch.removeReceiveObjectFromConfirmMQ(this.mqid);
                return reject(exception);
            }

            try {
                await this.batch.createAssetTxInRedis(assetTx, this.receiveObject);
            } catch (exception) {
                sails.log.error("[ReceiveBlockComfirmationProcessor.execute] error:batch.createAssetTxInRedis", exception);
                this.batch.removeReceiveObjectFromConfirmMQ(this.mqid);
                return reject(exception);
            }
            try {
                await this.batch.removeReceiveObjectFromConfirmMQ(this.mqid);
            } catch (exception) {
                sails.log.error("[ReceiveBlockComfirmationProcessor.execute] error:batch.removeReceiveObjectFromConfirmMQ", exception);
                this.batch.removeReceiveObjectFromConfirmMQ(this.mqid);
                return reject(exception);
            }
            let inWalletMQID;
            try {
                inWalletMQID = await this.batch.addReceiveObjectToInWalletMQ(this.receiveObject);
            } catch (exception) {
                sails.log.error("[ReceiveBlockComfirmationProcessor.execute] error:batch.addReceiveObjectToInWalletMQ", exception);
                return reject(exception);
            }
            resolve(inWalletMQID);
        });
    }

}

module.exports = ReceiveBlockComfirmationProcessor;