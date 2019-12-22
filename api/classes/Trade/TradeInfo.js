let TradeAssetUtil = require('../../utils/TradeAssetUtil');

class TradeInfo {
    constructor(userid) {
        this.userid = userid;
    }
    getHistoryOrder(){
        return new Promise(async (resolve, reject) => {
            let orders;
            try {
                orders = await TradeAssetUtil.getHistoryOrder(this.userid);
            } catch (exception) {
                sails.log.error(exception);
                reject(exception);
            }
            resolve(orders);
        });
    }

    getPendingOrder() {
        return new Promise(async (resolve, reject) => {
            let orders;
            try {
                orders = await TradeAssetUtil.findPendingOrder(this.userid);
            } catch (exception) {
                sails.log.error(exception);
                reject(exception);
            }
            resolve(orders);
        });
    }

    getFinishedOrder() {
        return new Promise(async (resolve, reject) => {
            let orders;
            try {
                orders = await TradeAssetUtil.findFinishedOrder(this.userid);
            } catch (exception) {
                sails.log.error(exception);
                reject(exception);
            }
            resolve(orders);
        });
    }

    getOrder() {
        return new Promise(async (resolve, reject) => {
            let orders;
            try {
                orders = await TradeAssetUtil.findOrder(this.userid);
            } catch (exception) {
                sails.log.error(exception);
                reject(exception);
            }
            resolve(orders);
        });
    }
    getAssetHistory() {
        return new Promise(async (resolve, reject) => {
            let assetHistory;
            try {
                assetHistory = await TradeAssetUtil.getTradeAssetHistory({userid:this.userid});
            } catch (exception) {
                sails.log.error(exception);
                reject(exception);
            }
            resolve(assetHistory);
        });
    }
    getBalance() {
        return new Promise(async (resolve, reject) => {
            let balanceFromRedis;
            try {
                balanceFromRedis = await TradeAssetUtil.getTradeAssetInRedis(this.userid);
            } catch (exception) {
                sails.log.error(exception);
                reject(exception);
            }
            resolve(JSON.parse(balanceFromRedis));
        });
    }
}
module.exports = TradeInfo;