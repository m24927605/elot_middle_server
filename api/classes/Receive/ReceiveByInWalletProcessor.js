class ReceiveByInWalletProcessor {

  constructor(receiveObject, mqid, batch) {
    this.receiveObject = receiveObject;
    this.batch = batch;
    this.mqid = mqid;
  }

  execute() {
    return new Promise(async (resolve, reject) => {
      sails.log.info('[ReceiveByInWalletProcessor.execute] start : userid ' + this.receiveObject.userid);
      const checkParaRes = await this.batch.checkInputData(this.receiveObject, this.mqid);

      if (checkParaRes == false || checkParaRes == 'false') {
        try {
          await this.batch.removeReceiveObjectFromInWalletMQ(this.mqid);
        } catch (exception) {
          sails.log.error('[ReceiveByInWalletProcessor.execute] removeReceiveObjectFromConfirmMQ  ', exception);
        }
        return reject({ input_data_error: this.receiveObject, mqid: this.mqid });
      }

      let isConfirmed;
      try {
        isConfirmed = await this.batch.isConfirmed(this.receiveObject);
      } catch (exception) {
        sails.log.error('[ReceiveByInWalletProcessor.execute batch.isConfirmed]', exception);
        this.batch.removeReceiveObjectFromInWalletMQ(this.mqid);
      }

      sails.log.info('[ReceiveByInWalletProcessor.execute] isConfirmed ' + isConfirmed);
      if (isConfirmed) {
        let assetHistory;
        try {
          assetHistory = await this.batch.updateAssetHistoryChecked(this.receiveObject.assetHistory.id);
        } catch (exception) {
          this.batch.removeReceiveObjectFromInWalletMQ(this.mqid);
          sails.log.error("[ReceiveByInWalletProcessor.execute batch.updateAssetHistoryChecked]", exception);
        }

        try {
          await this.batch.updateAssetHistoryInRedis(this.receiveObject.userid, assetHistory, this.receiveObject.assetHistoryDate);
        } catch (exception) {
          this.batch.removeReceiveObjectFromInWalletMQ(this.mqid);
          sails.log.error("[ReceiveByInWalletProcessor.execute batch.updateAssetHistoryChecked]", exception);
        }

        let assetTx;
        try {
          assetTx = await this.batch.updateAssetTx(this.receiveObject);
        } catch (exception) {
          this.batch.removeReceiveObjectFromInWalletMQ(this.mqid);
          sails.log.error("[ReceiveByInWalletProcessor.execute batch.updateAssetTx]", exception);
        }

        try {
          await this.batch.updateAssetTxInRedis(assetTx, this.receiveObject);
        } catch (exception) {
          this.batch.removeReceiveObjectFromInWalletMQ(this.mqid);
          sails.log.error("[ReceiveByInWalletProcessor.execute batch.updateAssetTxInRedis]", exception);
        }

        try {
          await this.batch.setReceiveAddressUnlocked(this.receiveObject);
        } catch (exception) {
          this.batch.removeReceiveObjectFromInWalletMQ(this.mqid);
          sails.log.error('[ReceiveByInWalletProcessor.execute] error batch.setReceiveAddressLocked ', exception);
        }

        try {
          await this.batch.removeReceiveObjectFromInWalletMQ(this.mqid);
        } catch (exception) {
          this.batch.removeReceiveObjectFromInWalletMQ(this.mqid);
          sails.log.error("[ReceiveByInWalletProcessor.execute batch.removeReceiveObjectFromInWalletMQ]", exception);
        }

        try {
          await this.batch.markNotInProcess(this.receiveObject.account);
        } catch (exception) {
          this.batch.removeReceiveObjectFromInWalletMQ(this.mqid);
          sails.log.error("[ReceiveByInWalletProcessor.execute batch.markNotInProcess]", exception);
        }
        resolve(isConfirmed);
      } else {
        sails.log.info('[ReceiveByInWalletProcessor.execute] end : isConfirmed ' + isConfirmed);
        resolve(isConfirmed);
      }
    });
  }
}
module.exports = ReceiveByInWalletProcessor;
