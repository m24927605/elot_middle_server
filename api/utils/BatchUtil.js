
const RedisUtil = require('../utils/RedisUtil');
const MQUtil = require('../utils/MQUtil');
const BatchUtil = () => { };

sails.config.mq.mqs.forEach(mq => {
    MQUtil.create(mq).then((msg) => { sails.log.info("MQUtil.create: qname", mq) }).catch((exception) => {
        //sails.log.info(exception);
    })
});
BatchUtil.getAddressBlockNumber = function (address, assetname) {
    sails.log.info('[BatchUtil.getAddressBlockNumber] start address:' + address + '_' + assetname);
    return RedisUtil.hget(sails.config.redis.address_block_hash, address + '_' + assetname);
};
BatchUtil.setAddressBlockNumber = function (address, assetname, blockNumber) {
    sails.log.info('[BatchUtil.setAddressBlockNumber] start address:' + address + '_' + assetname + ' blockNumber: ' + blockNumber);
    return RedisUtil.hset(sails.config.redis.address_block_hash, address + '_' + assetname, blockNumber);
};
BatchUtil.markAccountInProcess = function (address) {
    sails.log.info("[BatchUtil.markAccountInProcess ] start : address:" + address);
    return RedisUtil.hset(sails.config.redis.mq_onreceive_process_check, address, true);
};
BatchUtil.markAccountNotInProcess = function (address) {
    sails.log.info("[BatchUtil.markAccountNotInProcess] start: address " + address);
    return RedisUtil.hset(sails.config.redis.mq_onreceive_process_check, address, false);
};
BatchUtil.checkAccountProcessState = function (address) {
    sails.log.info("[BatchUtil.checkAccountProcessState] start : address" + address);
    return RedisUtil.hget(sails.config.redis.mq_onreceive_process_check, address);
};
BatchUtil.putToMQ = function (qname, message) {
    sails.log.info("[BatchUtil.putToMQ] start : qname" + qname);
    return MQUtil.sendMessage(qname, message);
};
BatchUtil.getFromMQ = function (qname, vt) {
    //sails.log.info("[BatchUtil.getFromMQ] start : qname "+ qname );
    let resp;
    try {
        resp = MQUtil.receiveMessage(qname, vt);
    } catch (exception) {
        sails.log.error("BatchUtil.getFromMQ : qname " + qname);
        sails.log.error(exception);
    }
    return resp;
};
BatchUtil.removeFromMQ = function (qname, id) {
    sails.log.info("[BatchUtil.removeFromMQ] start : qname" + qname + " id: " + id);
    return MQUtil.deleteMessage(qname, id);
};
module.exports = BatchUtil