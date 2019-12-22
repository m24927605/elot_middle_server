const Util = require('../utils/JsonRPCUtil');
const TradeAssetUtil = require('../utils/TradeAssetUtil');
const commonUtil = require('../utils/CommonUtil');
const Trade = require('../classes/Trade/Trade');
const TradeMatchProcessor = require('../classes/Trade/TradeMatchProcessor');
const tradingEx = new Trade();
module.exports = {
    findUserOrder(userid, start, end) {
        sails.log.info('[APITradeService.findUserOrder] start: userid: ' + userid + ' start: ' + start + ' end: ' + end);
        return TradeAssetUtil.findUserOrder(userid, start, end);
    },
    getAssetsCount: function () {
        sails.log.info('[APITradeService.getAssetsCount] start:');
        return TradeAssetUtil.getAssetsCount();
    },
    loadAssets: function (skip, limit) {
        sails.log.info('[APITradeService.loadAssets] start: skip:' + skip + ' limit:' + limit);
        return TradeAssetUtil.loadAssets(skip, limit);
    },
    fetchAssetTx: function (userid, asset, side) {
        sails.log.info('[APITradeService.loadAssets] start: userid' + userid);
        return TradeAssetUtil.loadAssetTx(userid, asset, side);
    },
    matchProcess: function () {
        var processor = new TradeMatchProcessor();
        processor.execute();
    },
    orderBook: function (market, side, offset, limit) {
        return tradingEx.orderBook(market, side, offset, limit);
    },
    getOrder: function (userid) {
        sails.log.info('[APITradeService.getOrder] start: userid' + userid);
        return tradingEx.getOrder(userid);
    },
    getPendingOrder: function(userid) {
        sails.log.info('[APITradeService.getPendingOrder] start: userid' + userid);
        return tradingEx.getPendingOrder(userid);
    },
    getFinishedOrder: function(userid) {
        sails.log.info('[APITradeService.getFinishedOrder] start: userid' + userid);
        return tradingEx.getFinishedOrder(userid);
    },
    getHistoryOrder: function(userid) {
        sails.log.info('[APITradeService.getFinishedOrder] start: userid' + userid);
        return tradingEx.getHistoryOrder(userid);
    },
    getAssetHistory(userid) {
        sails.log.info('[APITradeService.getAssetHistory] start: userid' + userid);
        return tradingEx.getAssetHistory(userid);
    },
    updateBalance: function (userid, asset, business, amount, detail) {
        return tradingEx.updateBalance(userid, asset, business, amount, detail);
    },
    getBalance: function (userid) {
        return tradingEx.getBalance(userid);
    },
    putLimit: function (userid, market, side, amount, price) {
        sails.log.info('[APITradeService.putLimit] start: userid' + userid + ' market: ' + market + ' side: ' + side + ' amount: ' + amount + ' price: ' + price);
        if (!commonUtil.checkDecimal(market, price, amount)) {
            return false;
        }
        return tradingEx.pubLimit(userid, market, side, amount, price);
    },
    cancelOrder: function (userid, market, orderid) {
        sails.log.info('[APITradeService.cancelOrder] start: userid' + userid + ' market: ' + market + ' orderid: ' + orderid);
        return tradingEx.cancelOrder(userid, market, orderid);
    },
    apiCall: function (userid, body) {
        return new Promise(function (resolve, reject) {
            var data = {
                id: userid,
                method: body.method,
                params: body.params
            };

            Util.Post(data).then((resData) => {
                resolve(resData);
            });
        })
    },
    JsonRPCCall: function (data) {
        return new Promise(function (resolve, reject) {
            Util.Post(data).then((resData) => {
                resolve(resData);
            });
        })
    }
}