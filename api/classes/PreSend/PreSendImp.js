const md5 = require('md5');
const BatchUtil = require('../../utils/BatchUtil');
const RiskUtil = require('../../utils/RiskUtil');
const RedisUtil = require('../../utils/RedisUtil');
const RPCUtil = require('../../utils/JsonRPCUtil');
class PreSendImp {
    constructor() {
        PreSendImp.instance = this;
    }
    static checkInputData(sendObject, mqid) {
        sails.log.info('[PreSendImp.checkInputData] start sendObject ' + JSON.stringify(sendObject) + ' mqid: ' + mqid);
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
        sails.log.info('[PreSendImp.checkInputData] end: response true ');
        return true;
    }
    static checkUser(userid) {
        sails.log.info('[PreSendImp.checkUser] start: userid' + userid);
        return RiskUtil.checkUser(userid);
    }
    static async sendEmail(sendObject) {
        sails.log.info('[PreSendImp.sendEmail] start: sendObject' + JSON.stringify(sendObject));
        const ts = new Date().getTime();
        const userid = sendObject.userid;
        const key = md5(String(ts + userid));
        sendObject.key = key;
        await RedisUtil.hset(sails.config.redis.email_url_hashkey, key, false);
        // send email including key and send object information start
        RPCUtil.Get('https://api.developblockchain.net/send/emailConfirm?key='+key);
        // send email including key and send object information end
        return sendObject;
    }
    static removeSendObjectFromMQ(mqid) {
        sails.log.info('[PreSendImp.removeSendObjectFromMQ] start: mqid' + mqid);
        return BatchUtil.removeFromMQ(sails.config.mq.presend_mq, mqid)
    }
    static getSendObjFromSendMQ() {
        return BatchUtil.getFromMQ(sails.config.mq.presend_mq, 10)
    }
    static add2PreSendConfirmMQ(sendObject) {
        sails.log.info('[PreSendImp.add2PreSendConfirmMQ] start: mq: ' + sails.config.mq.presend_mq_confirm);
        return BatchUtil.putToMQ(sails.config.mq.presend_mq_confirm, JSON.stringify(sendObject));
    }
}
module.exports = PreSendImp;