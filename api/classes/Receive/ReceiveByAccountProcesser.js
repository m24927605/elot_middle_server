class ReceiveByAccountProcesser {

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
          await this.batch.removeReceiveObjectFromReceiveMQ(this.mqid);
        } catch (exception) {
          sails.log.error('[ReceiveByAccountProcesser.execute] error batch.checkInputData', exception);
        }
        return reject({ input_data_error: this.receiveObject, mqid: this.mqid });
      }
      let balance;
      try {
        balance = await this.batch.getBalance(this.batch.getAddressFromAccount(this.receiveObject.account));
      } catch (exception) {
        sails.log.error('[ReceiveByAccountProcesser.execute] error batch.getBalance', exception);
      }
      if (this.batch.isOvertime(this.receiveObject.timestamp)) {
        try {
          await this.batch.removeReceiveObjectFromReceiveMQ(this.mqid);
        } catch (exception) {
          sails.log.error('[ReceiveByAccountProcesser.execute] error batch.isOvertime ', exception);
        }
      }
      let islocked;
      try {
        islocked = await this.batch.getReceiveAddressStatus(this.receiveObject);
      } catch (exception) {
        sails.log.error('[ReceiveByAccountProcesser.execute] error batch.getReceiveAddressStatus ', exception);
      }
      if (islocked) {
        sails.log.info('[ReceiveByAccountProcesser.execute] start : address is locked  param islocked' + islocked);
        await this.batch.removeReceiveObjectFromReceiveMQ(this.mqid);
        return resolve(balance);
      }
      if (!this.batch.checkBalance(balance)) {
        await this.batch.removeReceiveObjectFromReceiveMQ(this.mqid);
        return resolve(balance);
      }

      let fee;
      try {
        fee = await this.batch.getFee(this.receiveObject);
      } catch (exception) {
        sails.log.error('[ReceiveByAccountProcesser.execute] error batch.getFee', exception);
      }
      let checkFee;
      try {
        checkFee = await this.batch.checkFee(fee);
      } catch (exception) {
        sails.log.error('[ReceiveByAccountProcesser.execute] error batch.checkFee', exception);
      }
      if (!checkFee) {
        return resolve(fee);
      }
      try {
        await this.batch.setReceiveAddressLocked(this.receiveObject);
      } catch (exception) {
        sails.log.error('[ReceiveByAccountProcesser.execute] error batch.setReceiveAddressLocked ', exception);
      }
      let blockNumber = await this.batch.getCurrentBlock();
      this.receiveObject.balance = balance;
      this.receiveObject.blockNumber = blockNumber;
      
      try {
        await this.batch.removeReceiveObjectFromReceiveMQ(this.mqid);
      } catch (exception) {
        sails.log.error(exception);
      }

      try {
        await this.batch.addReceiveObjectToConfirmMQ(this.receiveObject);
      } catch (exception) {
        sails.log.error(exception);
      }
      
      resolve(balance);
    });
  }
}
module.exports = ReceiveByAccountProcesser;
