const JsonRPCUtil = require('../../utils/JsonRPCUtil');
const TradeAssetUtil = require('../../utils/TradeAssetUtil');

class TradeUpdateBalance {
    constructor(userid, asset, business, amount, detail) {
        this.userid = userid;
        this.asset = asset;
        this.business = business;
        this.amount = amount;
        this.detail = detail;
    }

    _getJSONRPCOfUpdateBalance() {
        sails.log.info('[TradeUpdateBalance._getJSONRPCOfUpdateBalance] start ');
        let amountStr = '';
        if (this.business === sails.config.trader.business_deposit) {
            amountStr = this.amount;
        } else if (this.business === sails.config.trader.business_withdraw) {
            amountStr = '-' + this.amount;
        }
        return {
            id: 2,
            method: sails.config.trader.balance_update,
            params: [parseInt(this.userid), this.asset, this.business, new Date().getTime(), String(amountStr), { message: this.detail }]
        };
    }

    updateBalance() {
        sails.log.info('[TradeUpdateBalance.updateBalance] start ');
        return new Promise(async (resolve, reject) => {
            const data = this._getJSONRPCOfUpdateBalance();
            sails.log.info('[TradeUpdateBalance.updateBalance] detail : json rpc requst data: ' + JSON.stringify(data));
            let resp;
            try {
                resp = await JsonRPCUtil.Post(data);
            } catch (exception) {
                sails.log.error('[TradeUpdateBalance.updateBalance] JsonRPCUtil.Post ', exception);
                return reject({ error: exception });
            }

            if (resp.error && resp.result.status != 'success') {
                sails.log.error('[TradeUpdateBalance.updateBalance] resp.error ', resp.error);
                return reject(resp.error);
            }

            let sideAssetHitory;
            let sideAsset;
            if (this.business == sails.config.trader.business_deposit) {
                sideAsset = sails.config.asset.assets_side_deposit;
                sideAssetHitory = sails.config.asset.trade_assets_history_side_deposit;
            } else if (this.business == sails.config.trader.business_withdraw) {
                sideAsset = sails.config.asset.assets_side_withdraw;
                sideAssetHitory = sails.config.asset.trade_assets_history_side_withdraw;
            }

            let assetHistory
            try {
                assetHistory = await TradeAssetUtil.createTradeAssetHistoryBalance(this.userid, this.asset, this.amount, this.detail, sideAssetHitory);
            } catch (exception) {
                sails.log.error('TradeAssetUtil.createTradeAssetHistoryBalance', exception);
            }

            let assetRecord = {};
            let assetAvailableName = String(this.asset).toLowerCase() + 'Available';
            assetRecord.userid = this.userid;
            assetRecord[assetAvailableName] = this.amount;

            let asset;
            try {
                asset = await TradeAssetUtil.updateTradeAssetBalance(this.userid, assetRecord, sideAsset, assetAvailableName);
            } catch (exception) {
                sails.log.error('TradeAssetUtil.updateTradeAsset', exception);
            }

            try {
                await TradeAssetUtil.updateTradeAssetHistoryInRedis(this.userid, assetHistory, sideAssetHitory);
            } catch (exception) {
                sails.log.error('TradeAssetUtil.updateTradeAssetHistoryInRedis', exception);
            }

            try {
                await TradeAssetUtil.updateTradeAssetInRedis(this.userid, asset);
            } catch (exception) {
                sails.log.error('TradeAssetUtil.updateTradeAssetInRedis', exception);
            }

            try {
                if (this.business === sails.config.trader.business_deposit) {
                    await TradeAssetUtil.addChangedInfoToMq(this.userid, asset, assetHistory, null, null);
                } else if (this.business === sails.config.trader.business_withdraw) {
                    await TradeAssetUtil.addChangedInfoToMq(this.userid, asset, null, assetHistory, null);
                }
            } catch (exception) {
                sails.log.error('TradeAssetUtil.addChangedInfoToMq', exception);
            }
            sails.log.info('[TradeUpdateBalance.updateBalance] end: response :' + JSON.stringify(resp.result));
            resolve(resp.result);
        });
    }
}

module.exports = TradeUpdateBalance;