RedisSMQ = require('rsmq');

rsmq = new RedisSMQ({ host: sails.config.mq.host, port: sails.config.mq.port, ns: sails.config.mq.ns });
const MQUtil = () => { };

MQUtil.create = (qname) => {
    return new Promise((resolve, reject) => {
        rsmq.createQueue({ qname: qname }, function (err, resp) {
            if (resp === 1) {
                resolve(resp)
            }
            if (err) {
                reject(err);
            }
        });
    });

}

MQUtil.sendMessage = (qname, message) => {
    return new Promise((resolve, reject) => {
        rsmq.sendMessage({ qname: qname, message: message }, function (err, resp) {
            if (resp) {
                resolve(resp);
            }
            if (err) {
                reject(err);
            }

        });
    });

}

MQUtil.receiveMessage = (qname, vt) => {
    //sails.log.info("MQUtil.receiveMessage",qname);
    return new Promise((resolve, reject) => {
        rsmq.receiveMessage({ qname: qname, vt: vt }, function (err, resp) {
            if (err) {
                return reject(err);
            }
            if (resp.id) {
                //sails.log.info("MQUtil.receiveMessage id",resp.id);
                return resolve(resp);
            } else {
                return resolve(resp.id);
            }
        });
    });
}

MQUtil.deleteMessage = (qname, id) => {
    return new Promise((resolve, reject) => {
        rsmq.deleteMessage({ qname: qname, id: id }, (err, resp) => {
            if (err) {
                reject(err);
            }
            if (resp === 1) {
                resolve(sails.config.mq.delet_success);
            } else {
                resolve(sails.config.mq.delet_msg_not_found);
            }
        });
    });
}
module.exports = MQUtil;
