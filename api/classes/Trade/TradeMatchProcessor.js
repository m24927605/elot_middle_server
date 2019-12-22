const TradeAssetUtil = require('../../utils/TradeAssetUtil');
const CommonUtil = require('../../utils/CommonUtil');
const TradeMatch = require('../../classes/Trade/TradeMatch');

class TradeMatchProcessor {
    constructor() {
        TradeMatchProcessor.instance = this;
    }

    _checkMatchObject(matchObject) {
        if (!matchObject) {
            return false;
        }
        if (!matchObject.userid) {
            return false;
        }
        if (!matchObject.assetFrozen) {
            return false;
        }
        if (!matchObject.assetPurchase) {
            return false;
        }
        if (!matchObject.order) {
            return false;
        }
        if (!matchObject.market) {
            return false;
        }
        return true;
    }

    async _removeMatchObjectFromMQ(id) {
        let removeMatchObjectResp;
        try {
            removeMatchObjectResp = await TradeAssetUtil.removeMatchResFromMq(id);
        } catch (exception) {
            sails.log.error(exception);
        }
        return removeMatchObjectResp;
    }

    async execute() {
        while (true) {
            const resp = await TradeAssetUtil.getMatchResFromMq(sails.config.mq.order_mq_match_frq)
            if (resp && resp.message) {
                const matchObject = JSON.parse(resp.message);
                try {
                    let matchRes;
                    if (this._checkMatchObject(matchObject)) {
                        const processor = new TradeMatch(
                            matchObject.userid,
                            matchObject.assetFrozen,
                            matchObject.assetPurchase,
                            matchObject.market,
                            matchObject.order
                        );
                        matchRes = await processor.processMatch();
                    }

                    if (Array.isArray(matchRes) && matchRes.length > 0) {
                        await this._removeMatchObjectFromMQ(resp.id);
                    }
                } catch (exception) {
                    sails.log.error(exception);
                }
            } else {
                await CommonUtil.sleep(sails.config.mq.no_data_sleep);
            }
        }
    }
}
module.exports = TradeMatchProcessor;