let JsonRPCUtil = require('../../utils/JsonRPCUtil');
let TradeAssetUtil = require('../../utils/TradeAssetUtil');
let CommonUtil = require('../../utils/CommonUtil');
class TradePutlimit {
    constructor(userid, market, side, amount, price) {
        this.userid = userid;
        this.market = market;
        this.side = side;
        this.amount = amount;
        this.price = price;
    }

    _processAsset(serverOrder) {
        return new Promise(async (resolve, reject) => {
            const assetRecord = {};
            assetRecord.userid = this.userid;
            const assetFrozenName = String(this.assetFrozen).toLowerCase() + 'Frozen';
            const assetAvailableName = String(this.assetFrozen).toLowerCase() + 'Available';
            if (this.side == sails.config.order.side_sell) {
                assetRecord[assetFrozenName] = parseFloat(serverOrder.amount);
            }

            if (this.side == sails.config.order.side_buy) {
                assetRecord[assetFrozenName] = CommonUtil.multiply(serverOrder.amount, serverOrder.price);
            }

            let tradeAsset;

            try {
                tradeAsset = await TradeAssetUtil.updateTradeAssetPutLimit(this.userid, assetRecord, assetFrozenName, assetAvailableName);
            } catch (exception) {
                sails.log.error('TradeAssetUtil.updateTradeAssetPutLimit', exception);
                reject(exception);
            }

            try {
                await TradeAssetUtil.updateTradeAssetInRedis(this.userid, tradeAsset);
            } catch (exception) {
                sails.log.error('TradeAssetUtil.updateTradeAssetInRedis', exception);
                reject(exception);
            }
            resolve(tradeAsset);
        })
    }

    _processOrder(serverOrder) {
        return new Promise(async (resolve, reject) => {
            let order;
            try {
                order = await TradeAssetUtil.createOrder(serverOrder);
                await TradeAssetUtil.updateOrderInRedis(this.userid, order.orderid, order);
            } catch (exception) {
                sails.log.error('TradePutlimit.createOrder', exception);
                reject(exception);
            }
            resolve(order);
        });
    }

    _getJSONRPCOfLimitedOrder() {
        return {
            id: 2,
            method: sails.config.trader.order_limit,
            params: [parseInt(this.userid), this.market, parseInt(this.side), this.amount, this.price, sails.config.order.taker_fee_rate, sails.config.order.maker_fee_rate, '']
        };
    }

    pubLimit() {
        return new Promise(async (resolve, reject) => {
            let putLimitResp;
            try {
                const data = this._getJSONRPCOfLimitedOrder();
                console.log('[_getJSONRPCOfLimitedOrder data]',data)
                putLimitResp = await JsonRPCUtil.Post(data);
                console.log('[putLimitResp]',putLimitResp)
            } catch (exception) {
                sails.log.error(exception)
                return reject({ error: exception });
            }

            if (putLimitResp.error && putLimitResp.result.status != 'success') {
                sails.log.error(putLimitResp.error);
                return reject(putLimitResp.error);
            } else {
                const marketParam = sails.config.trader.market_param[putLimitResp.result.market];
                if (putLimitResp.result.side == sails.config.order.side_sell) {
                    this.assetFrozen = marketParam.asset;
                    this.assetPurchase = marketParam.money;
                } else if (putLimitResp.result.side == sails.config.order.side_buy) {
                    this.assetFrozen = marketParam.money;
                    this.assetPurchase = marketParam.asset;
                }
            }
            //side: 1: sell, 2: buy
            if (putLimitResp && putLimitResp.result) {
                const order = await this._processOrder(putLimitResp.result);
                const asset = await this._processAsset(putLimitResp.result);
                try {
                    await TradeAssetUtil.addChangedInfoToMq(this.userid, asset, null, null, order, null, null);
                } catch (exception) {
                    sails.log.error('TradeAssetUtil.addChangedInfoToMq', exception);
                }
            }

            if (putLimitResp.result.deal_stock != '0' && putLimitResp.result.deal_money != '0' && putLimitResp.result.deal_fee != '0') {
                const matchObject = {};
                matchObject.userid = this.userid;
                matchObject.assetFrozen = this.assetFrozen;
                matchObject.assetPurchase = this.assetPurchase;
                matchObject.order = putLimitResp.result;
                matchObject.market = this.market;
                try {
                    TradeAssetUtil.addMatchResToMq(matchObject);
                } catch (exception) {
                    sails.log.error(exception);
                }
            }
            resolve(putLimitResp.result);
        });
    }
}
module.exports = TradePutlimit;