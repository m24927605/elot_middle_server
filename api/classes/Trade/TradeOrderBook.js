let JsonRPCUtil = require('../../utils/JsonRPCUtil');

class TradeOrderBook {

    constructor(market, side, offset, limit) {
        this.market = market;
        this.side = side;
        this.offset = offset;
        this.limit = limit;
    }

    _getJSONRPCOfOrderBook() {
        return {
            id: 3,
            method: sails.config.trader.order_book,
            params: [this.market, parseInt(this.side), parseInt(this.offset), parseInt(this.limit)]
        };
    }

    getOrderBook() {
        return new Promise(async (resolve, reject) => {
            const data = this._getJSONRPCOfOrderBook();
            let resp;
            try {
                resp = await JsonRPCUtil.Post(data);
            } catch (exception) {
                sails.log.error("JsonRPCUtil.Post", resp)
                sails.log.error(exception)
            }

            if (resp.error && resp.result.status != 'success') {
                sails.log.error(resp.error);
                return reject(resp.error);
            }
            resolve(resp.result);

        });
    }
}

module.exports = TradeOrderBook;