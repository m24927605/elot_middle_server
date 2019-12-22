let JsonRPCUtil = require('../../utils/JsonRPCUtil');
let TradeAssetUtil = require('../../utils/TradeAssetUtil');

class TradeConfirmOrder {
    constructor(market, orderid) {
        this.orderid = orderid;
        this.market = market;
    }

    _getJSONRPCOfFinishedOrder() {
        return {
            id: 5,
            method: sails.config.trader.order_finished_detail,
            params: [parseInt(this.orderid)]
        };
    }

    _getJSONRPCOfPendingOrder() {
        return {
            id: 6,
            method: sails.config.trader.order_pending_detail,
            params: [this.market, parseInt(this.orderid)]
        };
    }

    _getFinishedOrder() {
        return new Promise(async (resolve, reject) => {
            const data = this._getJSONRPCOfFinishedOrder();
            let resp;
            try {
                resp = await JsonRPCUtil.Post(data);
            } catch (exception) {
                sails.log.error("JsonRPCUtil.Post data", data)
                sails.log.error(exception)
            }

            if (resp.error && resp.result.status != 'success') {
                return reject(resp.error);
            }

            resolve(resp.result);

        });
    }

    _getPendingOrder() {
        return new Promise(async (resolve, reject) => {
            const data = this._getJSONRPCOfPendingOrder();
            let resp;
            try {
                resp = await JsonRPCUtil.Post(data);
            }
            catch (exception) {
                sails.log.error("JsonRPCUtil.Post data", data)
                sails.log.error(exception)
            }

            if (resp.error && resp.result.status != 'success') {
                sails.log.error(resp.error);
                return reject(resp.error);
            }

            resolve(resp.result);

        });
    }

    getOrder() {

        return new Promise(async (resolve, reject) => {

            let finishedOrder;
            try {
                finishedOrder = await this._getFinishedOrder();
            }
            catch (exception) {
                sails.log.error(exception);
            }


            if (finishedOrder == null || finishedOrder == 'null' || finishedOrder == undefined || finishedOrder == 'undefined') {
                let pendingOrder = await this._getPendingOrder();
                resolve(pendingOrder);

            } else {
                resolve(finishedOrder);
            }
        });
    }
}

module.exports = TradeConfirmOrder;