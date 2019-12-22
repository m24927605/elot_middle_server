let TradeUpdateBalance = require('../../classes/Trade/TradeUpdateBalance');
let TradeInfo = require('../../classes/Trade/TradeInfo');
let TradePutlimit = require('../../classes/Trade/TradePutlimit');
let TradeCancelOrder = require('../../classes/Trade/TradeCancelOrder');
let TradeOrderBook = require('../../classes/Trade/TradeOrderBook');

class Trade {
	contructor() {
		Trade.instance = this;
	}
	orderBook(market, side, offset, limit) {
		const orderBook = new TradeOrderBook(market, side, offset, limit);
		return orderBook.getOrderBook();
	}

	updateBalance(userid, asset, business, amount, detail) {
		const updateBalanceProcessor = new TradeUpdateBalance(userid, asset, business, amount, detail);
		return updateBalanceProcessor.updateBalance();
	}

	getBalance(userid) {
		const getBalanceProcessor = new TradeInfo(userid);
		return getBalanceProcessor.getBalance();
	}

	getPendingOrder(userid) {
		const getPendingOrderProcessor = new TradeInfo(userid);
		return getPendingOrderProcessor.getPendingOrder();
	}
	getFinishedOrder(userid){
		const getFinishedOrderProcessor = new TradeInfo(userid);
		return getFinishedOrderProcessor.getFinishedOrder();
	}

	getHistoryOrder(userid){
		const getHistoryOrderProcessor = new TradeInfo(userid);
		return getHistoryOrderProcessor.getHistoryOrder();
	}

	getOrder(userid) {
		const getOrderProcessor = new TradeInfo(userid);
		return getOrderProcessor.getOrder();
	}

	getAssetHistory(userid) {
		const getAssetHistoryProcessor = new TradeInfo(userid);
		return getAssetHistoryProcessor.getAssetHistory();
	}

	pubLimit(userid, market, side, amount, price) {
		const putLimitProcessor = new TradePutlimit(userid, market, side, amount, price);
		return putLimitProcessor.pubLimit();
	}

	cancelOrder(userid, market, orderid) {
		const cancelOrderProcessor = new TradeCancelOrder(userid, market, orderid);
		return cancelOrderProcessor.cancelOrder();
	}
}

module.exports = Trade;