const TradeFinishedOrder = require('../../classes/Trade/TradeFinishedOrder');
const TradeOrderDeals = require('../../classes/Trade/TradeOrderDeals');
const TradeConfirmOrder = require('../../classes/Trade/TradeConfirmOrder');

class TradeMatch {
    constructor(userid, assetFrozen, assetPurchase, market, order) {
        this.userid = userid;
        this.assetFrozen = assetFrozen;
        this.assetPurchase = assetPurchase;
        this.order = order;
        this.market = market;
    }

    processMatch() {
        return new Promise(async (resolve, reject) => {
            try {
                const finishedOrderProcessor = new TradeFinishedOrder(this.userid, this.assetFrozen, this.assetPurchase, this.order);
                await finishedOrderProcessor.processFinishOrder();
            } catch (exception) {
                reject(exception);
                sails.log.error(exception);
            }

            try {
                const orderDealsProcessor = new TradeOrderDeals(this.order.id);
                const orderDeals = await orderDealsProcessor.fetchOrderDeals(0);
                for (let i = orderDeals.length - 1; i >= 0; i--) {
                    const confirmOrder = new TradeConfirmOrder(this.market, orderDeals[i].deal_order_id)
                    const orderInfo = await confirmOrder.getOrder();
                    const finishedOrderProcessor = new TradeFinishedOrder(
                        orderInfo.user,
                        this.assetPurchase,
                        this.assetFrozen,
                        orderInfo,
                        orderDeals[i]
                    );
                    await finishedOrderProcessor.processFinishOrder();
                }
                resolve(orderDeals);
            } catch (exception) {
                reject(exception);
                sails.log.error(exception);
            }
        });
    }
}

module.exports = TradeMatch;