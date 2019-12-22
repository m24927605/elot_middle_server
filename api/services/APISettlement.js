const TradeAssetUtil = require('../utils/TradeAssetUtil');
const settlementUtil = require('../utils/Settlement');
const common = require('../utils/CommonUtil');
const md5 = require('md5');

module.exports = {
    transfer: async function (from, to, asset, size) {
        sails.log.info(`[APISettlement.transfer] from: ${from}  to: ${to} asset: ${asset} size: ${size}`);
        try {
            const result = await TradeAssetUtil.transfer(from,to,asset,size);
            return result;
        } catch (error) {
            return error;
        }
        
    },
    exchangeGBAsset: async function (userid, money, asset, size, price) {
        sails.log.info(`[APISettlement.exchangeGBAsset] start: userid:${userid} asset:${asset} money:${money} size:${size} price:${price} `);
        try {
            const result = {};
            const gbAsset = {};
            gbAsset[`${String(money).toLowerCase()}Available`] = size;
            gbAsset[`${String(asset).toLowerCase()}Available`] = parseFloat(common.multiply(size, price)).toFixed(8);
            result.tradeAsset = await TradeAssetUtil.exchangeBalance(
                userid,
                gbAsset,
                `${String(asset).toLowerCase()}Available`,
                `${String(money).toLowerCase()}Available`
            );

            if (result.tradeAsset && result.tradeAsset.userid) {
                await TradeAssetUtil.updateTradeAssetInRedis(userid, result.tradeAsset);
                const tradeAssetOut = {};
                tradeAssetOut.inout = sails.config.asset.trade_assets_history_out;
                tradeAssetOut.state = sails.config.asset.trade_assets_history_state_sell;
                tradeAssetOut.detail = "exchangeGBAsset sell";
                tradeAssetOut.side = sails.config.asset.trade_assets_history_side_sell;
                tradeAssetOut.amount = size;
                tradeAssetOut.asset = money;
                tradeAssetOut.userid = userid;
                result.tradeMoney = await TradeAssetUtil.exchangeBalanceHistory(
                    tradeAssetOut.userid,
                    tradeAssetOut.asset,
                    tradeAssetOut.amount,
                    tradeAssetOut.inout,
                    tradeAssetOut.state,
                    tradeAssetOut.side,
                    tradeAssetOut.detail
                );

                const tradeAssetIn = {};
                tradeAssetIn.inout = sails.config.asset.trade_assets_history_in;
                tradeAssetIn.state = sails.config.asset.trade_assets_history_state_buy;
                tradeAssetIn.detail = "exchangeGBAsset buy";
                tradeAssetIn.side = sails.config.asset.trade_assets_history_side_buy;
                tradeAssetIn.amount = common.multiply(size, price);
                tradeAssetIn.asset = asset;
                tradeAssetIn.userid = userid;
                result.tradeToken = await TradeAssetUtil.exchangeBalanceHistory(
                    tradeAssetIn.userid,
                    tradeAssetIn.asset,
                    tradeAssetIn.amount,
                    tradeAssetIn.inout,
                    tradeAssetIn.state,
                    tradeAssetIn.side,
                    tradeAssetIn.detail
                );
            }
            return result;
        } catch (error) {
            return error;
        }
    },

    putGBOrder: async function (asset, size, userid) {
        sails.log.info(`[APISettlement.putGBOrder] start: userid:${userid} asset:${asset} size:${size} `);
        try {
            const settlementObj = { settlement_id: md5(new Date().getTime() + userid), asset, size, userid };
            await settlementUtil.add(settlementObj);

            const gbAsset = {};
            gbAsset[`${String(asset).toLowerCase()}Frozen`] = size;

            const result = await TradeAssetUtil.putGBOrder(userid, gbAsset, `${String(asset).toLowerCase()}Frozen`, `${String(asset).toLowerCase()}Available`);
            if (result && result.userid) {
                await TradeAssetUtil.updateTradeAssetInRedis(userid, result);
            }

            return result;
        } catch (error) {
            sails.log.error(`[APISettlement.settle] ${JSON.stringify(error)}`);
            return error
        }
    },
    settleCommission: async function (userid, coin, size) {
        sails.log.info(`[APISettlement.settleCommission] start userid :${userid} coin :${coin} size : ${size}`);
        try {
            const gbAsset = {}
            gbAsset[`${String(coin).toLowerCase()}Available`] = size;

            let side, state, inout, detail, amount;
            if (parseFloat(size) < 0) {
                side = sails.config.asset.trade_assets_history_side_lose;
                state = sails.config.asset.trade_assets_history_state_lose;
                detail = "Commission Lose";
                amount = size;
                inout = sails.config.asset.trade_assets_history_out;
            } else {
                side = sails.config.asset.trade_assets_history_side_win;
                state = sails.config.asset.trade_assets_history_state_win;
                detail = "Commission Earn";
                amount = size;
                inout = sails.config.asset.trade_assets_history_in;
            }

            const result = await TradeAssetUtil.settleCommission(
                userid,
                gbAsset,
                coin,
                `${String(coin).toLowerCase()}Available`,
                amount,
                side,
                state,
                inout,
                detail
            );
            return result;
        } catch (error) {
            return error;
        }
    },

    settleGBOrder: async function (userid, coin, orderSize, winSize) {
        sails.log.info(`[APISettlement.settleGBOrder] start: userid:${userid} coin:${coin} orderSize:${orderSize} winSize:${winSize}`);
        try {
            const gbAsset = {}
            gbAsset[`${String(coin).toLowerCase()}Frozen`] = orderSize;
            gbAsset[`${String(coin).toLowerCase()}Available`] = winSize;
            let side, state, inout, detail, amount;
            if (winSize === 0 || winSize === "0") {
                side = sails.config.asset.trade_assets_history_side_lose;
                state = sails.config.asset.trade_assets_history_state_lose;
                detail = "LOSE";
                amount = `-${orderSize}`;
                inout = sails.config.asset.trade_assets_history_out;
            } else {
                side = sails.config.asset.trade_assets_history_side_win;
                state = sails.config.asset.trade_assets_history_state_win;
                detail = "WIN";
                amount = common.subtract(winSize, orderSize);
                inout = sails.config.asset.trade_assets_history_in;
            }
            const result = await TradeAssetUtil.settleGBOrder(
                userid,
                gbAsset,
                coin,
                `${String(coin).toLowerCase()}Frozen`,
                `${String(coin).toLowerCase()}Available`,
                amount,
                side,
                state,
                inout,
                detail
            );
            return result;
        } catch (error) {
            return error;
        }
    }
}