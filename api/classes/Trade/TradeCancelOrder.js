let JsonRPCUtil = require('../../utils/JsonRPCUtil');
let TradeAssetUtil = require('../../utils/TradeAssetUtil');
let CommonUtil = require('../../utils/CommonUtil');
let TradeOrderDeals = require('../../classes/Trade/TradeOrderDeals');

class TradeCancelOrder {

    constructor(userid, market, orderid) {
        this.userid = userid;
        this.market = market;
        this.orderid = orderid;
        this.amount = 0;
        this.deal = 0;
    }

    _getJSONRPCOfCancelOrder() {
        return {
            id: 3,
            method: sails.config.trader.order_cancel,
            params: [parseInt(this.userid), this.market, this.orderid]
        };
    }

    cancelOrder() {
        return new Promise(async (resolve, reject) => {
            const data = this._getJSONRPCOfCancelOrder();
            let resp;
            try {
                resp = await JsonRPCUtil.Post(data);
            } catch (exception) {
                sails.log.error("JsonRPCUtil.Post", resp)
                sails.log.error(exception);
                return reject({ error: exception });
            }

            if (resp.error && resp.result.status != 'success') {
                sails.log.error(resp.error);
                return reject(resp.error);
            } else {
                let marketParam = sails.config.trader.market_param[resp.result.market];
                if (resp.result.side == sails.config.order.side_sell) {
                    this.money = marketParam.asset;
                } else if (resp.result.side == sails.config.order.side_buy) {
                    this.money = marketParam.money;
                }
            }
            let cancelOrder;
            try {
                cancelOrder = await TradeAssetUtil.updateOrderCancel(this.orderid);
            } catch (exception) {
                sails.log.error("TradeAssetUtil.updateOrderCancel", resp)
                sails.log.error(exception)
            }
            const orderDealsProcessor = new TradeOrderDeals(this.orderid);
            let orderDeals = await orderDealsProcessor.fetchOrderDeals(0);

            for (let i = orderDeals.length - 1; i >= 0; i--) {
                this.amount = CommonUtil.add(orderDeals[i].amount, this.amount);
                this.deal = CommonUtil.add(orderDeals[i].deal, this.deal);
            }


            const assetRecord = {};
            const assetFrozen = String(this.money).toLowerCase() + 'Frozen';
            const assetAvailable = String(this.money).toLowerCase() + 'Available';
            assetRecord.userid = this.userid;


            if (resp.result.side == sails.config.order.side_sell)//sell 1
            {
                assetRecord[assetFrozen] = CommonUtil.subtract(resp.result.amount, this.amount).toString();
            }
            else if (resp.result.side == sails.config.order.side_buy)//buy 2
            {
                assetRecord[assetFrozen] = CommonUtil.subtract(CommonUtil.multiply(resp.result.amount, resp.result.price), this.deal).toString();
            }
            let cancelTradeAsset;
            try {
                console.log('this.userid', this.userid);
                console.log('assetRecord', assetRecord);
                console.log('assetFrozen', assetFrozen);
                console.log('assetAvailable', assetAvailable);
                cancelTradeAsset = await TradeAssetUtil.updateCancelAsset(this.userid, assetRecord, assetFrozen, assetAvailable);
            }
            catch (exception) {
                sails.log.error("TradeAssetUtil.updateOrderCancel", resp)
                sails.log.error(exception)
            }


            let redisUpdateAssetResp;
            try {
                redisUpdateAssetResp = await TradeAssetUtil.updateTradeAssetInRedis(this.userid, cancelTradeAsset);
            } catch (exception) {
                sails.log.error('TradeAssetUtil.updateTradeAssetInRedis', exception);
            }

            let redisUpdateOrderResp

            try {
                redisUpdateOrderResp = await TradeAssetUtil.updateOrderInRedis(this.userid, cancelOrder.orderid, cancelOrder);
            } catch (exception) {
                sails.log.error('TradeAssetUtil.updateOrderInRedis', exception);
            }

            try {
                await TradeAssetUtil.addChangedInfoToMq(this.userid, cancelTradeAsset, null, null, null, cancelOrder, null);
            } catch (exception) {
                sails.log.error('TradeAssetUtil.addChangedInfoToMq', exception);
            }

            resolve(resp.result);

        });
    }
}

module.exports = TradeCancelOrder;