const BatchUtil = require('../../utils/BatchUtil');
const RedisUtil = require('../../utils/RedisUtil');
class PreSendConfirmImp {
    constructor() {
        PreSendConfirmImp.instance = this;
    }
    static checkInputData(sendObject, mqid) {
        sails.log.info('[PreSendConfirmImp.checkInputData] start sendObject ' + JSON.stringify(sendObject) + ' mqid: ' + mqid);
        if (!mqid) {
            return false;
        }
        if (!sendObject.timestamp) {
            return false;
        }
        if (!sendObject.userid) {
            return false;
        }
        if (!sendObject.assetname) {
            return false;
        }
        if (!sendObject.address) {
            return false;
        }
        if (!sendObject.size) {
            return false;
        }
        if (!sendObject.key) {
            return false;
        }
        sails.log.info('[PreSendConfirmImp.checkInputData] end: response true ');
        return true;
    }
    static async isOvertime(timestamp, key) {
        sails.log.info('[PreSendConfirmImp.isOvertime] start:  overtime left' + sails.config.mq.on_presend_ttl - new Date().getTime() + parseInt(timestamp));
        if (sails.config.mq.on_presend_ttl < new Date().getTime() - parseInt(timestamp)) {
            await RedisUtil.hset(sails.config.redis.email_url_hashkey, key, sails.config.constant.over_time)
            return true
        } else {
            return false;
        }
    }
    static checkEmailConfirm(key) {
        sails.log.info('[PreSendConfirmImp.checkEmailConfirm] start: key' + key);
        return RedisUtil.hget(sails.config.redis.email_url_hashkey, key);
    }
    static removeSendObjectFromPresendConfirmMQ(mqid) {
        sails.log.info('[PreSendConfirmImp.removeSendObjectFromPresendConfirmMQ] start: mqid' + mqid);
        return BatchUtil.removeFromMQ(sails.config.mq.presend_mq_confirm, mqid)
    }
    static getSendObjFromPresendConfirmMQ() {
        return BatchUtil.getFromMQ(sails.config.mq.presend_mq_confirm, 10)
    }
    static addSendObject2SendMQ(sendObject) {
        sails.log.info('[PreSendConfirmImp.addSendObject2SendMQ] start:');
        return WalletSendService.addSendObjectToSendMQ(sendObject);
    }
}
module.exports = PreSendConfirmImp;