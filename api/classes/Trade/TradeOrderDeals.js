const JsonRPCUtil = require('../../utils/JsonRPCUtil');
class TradeOrderDeals {
    constructor(orderid) {
        this.orderid = orderid;
        this.orderDealsArray = [];
    }

    _getJSONRPCOfOrderDeals(offset, limit) {
        return {
            id: 3,
            method: sails.config.trader.order_deals,
            params: [parseInt(this.orderid), parseInt(offset), parseInt(limit)]
        };
    }

    _getOrderDealsFromServer(data) {
        return new Promise(async (resolve, reject) => {
            let resp;
            try {
                resp = await JsonRPCUtil.Post(data);
            } catch (exception) {
                sails.log.error("JsonRPCUtil.Post _getOrderDealsFromServer", data)
                sails.log.error(exception)
            }

            if (resp.error && resp.result.status != 'success') {
                sails.log.error(resp.error);
                return reject(resp.error);
            }
            resolve(resp.result);
        });
    }

    _setOrderDealsArray(orders) {
        for (let i = orders.length - 1; i >= 0; i--) {
            this.orderDealsArray.push(orders[i]);
        }
    }

    async fetchOrderDeals(offset) {
        const limit = sails.config.order.limit;
        let data = this._getJSONRPCOfOrderDeals(offset, limit);
        let orderDeals;
        try {
            orderDeals = await this._getOrderDealsFromServer(data);
        } catch (exception) {
            sails.log.error('FetchOrderBook._getOrderDealsFromServer', exception);
        }
        this._setOrderDealsArray(orderDeals.records);
        if (orderDeals.records.length == sails.config.order.limit) {
            return this.fetchOrderDeals(offset + limit);
        } else {
            return this.orderDealsArray;
        }
    }
}
module.exports = TradeOrderDeals;
