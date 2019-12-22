const TradeAssetUtil = require('../../utils/TradeAssetUtil');
const CommonUtil = require('../../utils/CommonUtil');

class TradeFinishedOrder {
    constructor(userid, assetFrozen, assetPurchase, serverOrder, serverDeals) {
        this.userid = userid;
        this.assetFrozen = assetFrozen;
        this.assetPurchase = assetPurchase;
        this.serverOrder = serverOrder;
        this.serverDeals = serverDeals;
    }

    _updateTradeAssetHistoryOut() {
        return new Promise(async (resolve, reject) => {
            const tradeAssetHistoryOut = {};
            tradeAssetHistoryOut.userid = this.userid;
            tradeAssetHistoryOut.asset = this.assetFrozen;
            tradeAssetHistoryOut.fee = 0;
            tradeAssetHistoryOut.inout = sails.config.asset.trade_assets_history_out;
            tradeAssetHistoryOut.detail = JSON.stringify(this.serverOrder);

            if (this.serverOrder.side == sails.config.order.side_sell) {
                if (!this.serverDeals) {
                    tradeAssetHistoryOut.amount = CommonUtil.formatDecimal(this.serverOrder.deal_stock);
                } else {
                    tradeAssetHistoryOut.amount = CommonUtil.formatDecimal(this.serverDeals.amount);
                }
                tradeAssetHistoryOut.side = sails.config.asset.trade_assets_history_side_sell;
                tradeAssetHistoryOut.state = sails.config.asset.trade_assets_history_state_sell;

            } else if (this.serverOrder.side == sails.config.order.side_buy) {
                if (!this.serverDeals) {
                    tradeAssetHistoryOut.amount = CommonUtil.formatDecimal(this.serverOrder.deal_money);
                } else {
                    tradeAssetHistoryOut.amount = CommonUtil.formatDecimal(this.serverDeals.deal);
                }
                tradeAssetHistoryOut.side = sails.config.asset.trade_assets_history_side_buy;
                tradeAssetHistoryOut.state = sails.config.asset.trade_assets_history_state_buy;
            }

            tradeAssetHistoryOut.timestamp = new Date().getTime();

            let tradeAssetHistoryRespOut;
            try {
                tradeAssetHistoryRespOut = await TradeAssetUtil.createTradeAssetHistory(tradeAssetHistoryOut);
            } catch (exception) {
                sails.log.error('TradeAssetUtil.createTradeAssetHistory', exception);
            }

            try {
                await TradeAssetUtil.updateTradeAssetHistoryInRedis(this.userid, tradeAssetHistoryRespOut, tradeAssetHistoryRespOut.side);
            } catch (exception) {
                sails.log.error('TradeAssetUtil.updateTradeAssetHistoryInRedis', exception);
            }
            return resolve(tradeAssetHistoryOut);
        });

    }

    _updateTradeAssetHistoryIn() {
        return new Promise(async (resolve, reject) => {
            const tradeAssetHistoryIn = {};
            tradeAssetHistoryIn.userid = this.userid;
            tradeAssetHistoryIn.asset = this.assetPurchase;
            tradeAssetHistoryIn.inout = sails.config.asset.trade_assets_history_in;
            tradeAssetHistoryIn.detail = JSON.stringify(this.serverOrder);

            if (this.serverOrder.side == sails.config.order.side_sell) {
                if (!this.serverDeals) {
                    tradeAssetHistoryIn.fee = CommonUtil.formatDecimal(this.serverOrder.deal_fee);
                    tradeAssetHistoryIn.amount = CommonUtil.formatDecimal(this.serverOrder.deal_money);
                } else {
                    tradeAssetHistoryIn.fee = String(CommonUtil.multiply(this.serverDeals.deal, sails.config.order.maker_fee_rate));
                    tradeAssetHistoryIn.amount = CommonUtil.formatDecimal(this.serverDeals.deal);
                }

                tradeAssetHistoryIn.side = sails.config.asset.trade_assets_history_side_sell;
                tradeAssetHistoryIn.state = sails.config.asset.trade_assets_history_state_sell;

            } else if (this.serverOrder.side == sails.config.order.side_buy) {
                if (!this.serverDeals) {
                    tradeAssetHistoryIn.fee = CommonUtil.formatDecimal(this.serverOrder.deal_fee);
                    tradeAssetHistoryIn.amount = CommonUtil.formatDecimal(this.serverOrder.deal_stock);
                } else {
                    tradeAssetHistoryIn.fee = String(CommonUtil.multiply(this.serverDeals.amount, sails.config.order.maker_fee_rate));
                    tradeAssetHistoryIn.amount = CommonUtil.formatDecimal(this.serverDeals.amount);
                }

                tradeAssetHistoryIn.side = sails.config.asset.trade_assets_history_side_buy;
                tradeAssetHistoryIn.state = sails.config.asset.trade_assets_history_state_buy;
            }
            tradeAssetHistoryIn.timestamp = new Date().getTime();

            let tradeAssetHistoryRespIn;
            try {
                tradeAssetHistoryRespIn = await TradeAssetUtil.createTradeAssetHistory(tradeAssetHistoryIn);
            } catch (exception) {
                sails.log.error('TradeAssetUtil.createTradeAssetHistory', exception);
            }
            try {
                await TradeAssetUtil.updateTradeAssetHistoryInRedis(this.userid, tradeAssetHistoryRespIn, tradeAssetHistoryRespIn.side);
            } catch (exception) {
                sails.log.error('TradeAssetUtil.updateTradeAssetHistoryInRedis', exception);
            }
            return resolve(tradeAssetHistoryIn);
        });
    }

    _updateTradeAsset() {
        return new Promise(async (resolve, reject) => {

            let tradeAssetRecord = {};
            let assetAvailableName;
            let assetFrozenName;
            tradeAssetRecord.userid = this.userid;
            if (this.serverOrder.side == sails.config.order.side_sell) {
                assetAvailableName = String(this.assetPurchase).toLowerCase() + 'Available';
                assetFrozenName = String(this.assetFrozen).toLowerCase() + 'Frozen';
                if (!this.serverDeals) {
                    tradeAssetRecord[assetAvailableName] = CommonUtil.subtract(this.serverOrder.deal_money, this.serverOrder.deal_fee).toString();
                    tradeAssetRecord[assetFrozenName] = CommonUtil.formatDecimal(this.serverOrder.deal_stock);
                } else {
                    tradeAssetRecord[assetAvailableName] = CommonUtil.subtract(this.serverDeals.deal, CommonUtil.multiply(this.serverDeals.deal, sails.config.order.taker_fee_rate)).toString();
                    tradeAssetRecord[assetFrozenName] = CommonUtil.formatDecimal(this.serverDeals.amount);
                }
            } else if (this.serverOrder.side == sails.config.order.side_buy) {
                assetAvailableName = String(this.assetPurchase).toLowerCase() + 'Available';
                assetFrozenName = String(this.assetFrozen).toLowerCase() + 'Frozen';
                if (!this.serverDeals) {
                    tradeAssetRecord[assetAvailableName] = CommonUtil.subtract(this.serverOrder.deal_stock, this.serverOrder.deal_fee).toString();
                    tradeAssetRecord[assetFrozenName] = CommonUtil.formatDecimal(this.serverOrder.deal_money);
                } else {
                    tradeAssetRecord[assetAvailableName] = CommonUtil.subtract(this.serverDeals.amount, CommonUtil.multiply(this.serverDeals.amount, sails.config.order.taker_fee_rate)).toString();
                    tradeAssetRecord[assetFrozenName] = CommonUtil.formatDecimal(this.serverDeals.deal);
                }
            }

            let tradeAsset;
            try {
                tradeAsset = await TradeAssetUtil.updateTradeAssetFinishedOrder(this.userid, tradeAssetRecord, assetAvailableName, assetFrozenName);
            } catch (exception) {
                sails.log.error('TradeAssetUtil.updateTradeAssetFinishedOrder', exception);
            }

            try {
                await TradeAssetUtil.updateTradeAssetInRedis(tradeAssetRecord.userid, tradeAsset);
            } catch (exception) {
                sails.log.error('TradeAssetUtil.updateTradeAssetInRedis', exception);
            }
            resolve(tradeAsset);
        });
    }

    _updateOrder() {
        return new Promise(async (resolve, reject) => {
            // sails.log.info('this.serverOrder',this.serverOrder);
            let orderUpdated;
            try {
                orderUpdated = await TradeAssetUtil.updateOrderFinish(this.serverOrder.id, this.serverOrder);
            } catch (exception) {
                sails.log.error(exception);
            }
            try {
                await TradeAssetUtil.updateOrderInRedis(this.userid, orderUpdated.orderid, orderUpdated);
            } catch (exception) {
                sails.log.error('TradeAssetUtil.updateOrderInRedis', exception);
            }
            return resolve(this.serverOrder);
        });

    }

    processFinishOrder() {
        return new Promise(async (resolve, reject) => {
            const tradeAsset = await this._updateTradeAsset();
            //sails.log.error('TradeFinishedOrder.processFinishOrder tradeAsset',tradeAsset);
            const tradeAssetHistoryOut = await this._updateTradeAssetHistoryOut();
            // sails.log.error('TradeFinishedOrder.processFinishOrder tradeAssetHistoryOut',tradeAssetHistoryOut);
            const tradeAssetHistoryIn = await this._updateTradeAssetHistoryIn();
            // sails.log.error('TradeFinishedOrder.processFinishOrder tradeAssetHistoryIn',tradeAssetHistoryIn);
            const order = await this._updateOrder();
            // sails.log.error('TradeFinishedOrder.processFinishOrder order',order);
            try {
                await TradeAssetUtil.addChangedInfoToMq(this.userid, tradeAsset, tradeAssetHistoryIn, tradeAssetHistoryOut, null, null, order);
            } catch (exception) {
                sails.log.error('TradeAssetUtil.addChangedInfoToMq', exception);
            }
            resolve(order);
        });
    }
}
module.exports = TradeFinishedOrder;