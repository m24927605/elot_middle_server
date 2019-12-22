module.exports = {
    updateConfig: function (req, res) {
        if (req.body.coin == null) {
            return res.json(200, { err: 'coin required' });
        }
        if (req.body.asset == null) {
            return res.json(200, { err: 'asset required' });
        }
        APIAdminService.updateConfig(req.body.coin, JSON.parse(req.body.asset)).then((records) => {
            APIAdminService.loadConfig().then(() => {
                res.json(200, { state: 'success', records });
            });
        })
    },
    getAssetsCount: function (req, res) {
        APITradeService.getAssetsCount().then((cnt) => {
            res.json(200, { count: cnt });
        })
    },
    getAssets: function (req, res) {
        if (req.body.skip == null) {
            return res.json(200, { err: 'skip required' });
        }
        if (req.body.limit == null) {
            return res.json(200, { err: 'limit required' });
        }
        APITradeService.loadAssets(req.body.skip, req.body.limit).then((recs) => {
            res.send(200, recs);
        })
    },
    orderBook: function (req, res) {
        sails.log.info('[TradeController.getAssetHistory] start: market ' + req.body.market + ' limit:' + req.body.limit + ' offset: ' + req.body.offset + ' side: ' + req.body.side);
        if (req.body.market == null || req.body.market == undefined) {
            return res.json(200, { err: 'market required' });
        }
        if (req.body.side == null || req.body.side == undefined) {
            return res.json(200, { err: 'side required' });
        }
        if (req.body.offset == null || req.body.offset == undefined) {
            return res.json(200, { err: 'offset required' });
        }
        if (req.body.limit == null || req.body.limit == undefined) {
            return res.json(200, { err: 'limit required' });
        }
        APITradeService.orderBook(req.body.market, req.body.side, req.body.offset, req.body.limit).then((result) => {
            res.json(200, result);
        }).catch((exception) => {
            res.json(200, exception);
        })
    },
    getAssetHistory: function (req, res) {
        sails.log.info('[TradeController.getAssetHistory] start: userid ' + req.body.userid);
        if (!req.body.userid) {
            return res.json(200, { err: 'userid required' });
        }
        APITradeService.getAssetHistory(req.body.userid).then((result) => {
            res.send(200, result);
        }).catch((exception) => {
            sails.log.error('exception', exception);
            res.json(200, exception);
        })
    },
    findUserOrder: function (req, res) {
        sails.log.info('[TradeController.finduserOrder] start: userid: ' + req.body.userid + ' start: ' + req.body.start + ' end: ' + req.body.end);
        if (!req.body.userid) {
            return res.json(200, { err: 'userid required' });
        }
        if (!req.body.start) {
            return res.json(200, { err: 'start required' });
        }
        if (!req.body.end) {
            return res.json(200, { err: 'end required' });
        }
        const start = String(new Date(req.body.start).getTime()).substring(0, 10);
        const end = String(new Date(req.body.end).getTime()).substring(0, 10);
        APITradeService.findUserOrder(req.body.userid, start, end).then((result) => {
            res.json(200, result);
        }).catch((exception) => {
            sails.log.error('exception', exception);
            res.json(200, exception);
        })
    },
    getPendingOrder: function (req, res) {
        sails.log.info('[TradeController.getPendingOrder] start: userid ' + req.body.userid);
        if (!req.body.userid) {
            return res.json(200, { err: 'userid required' });
        }
        APITradeService.getPendingOrder(req.body.userid).then((result) => {
            res.json(200, result);
        }).catch((exception) => {
            sails.log.error('exception', exception);
            res.json(200, exception);
        })
    },
    getFinishedOrder: function (req, res) {
        sails.log.info('[TradeController.getFinishedOrder] start: userid ' + req.body.userid);
        if (!req.body.userid) {
            return res.json(200, { err: 'userid required' });
        }
        APITradeService.getFinishedOrder(req.body.userid).then((result) => {
            res.json(200, result);
        }).catch((exception) => {
            sails.log.error('exception', exception);
            res.json(200, exception);
        })
    },
    getHistoryOrder: function (req, res) {
        sails.log.info('[TradeController.getFinishedOrder] start: userid ' + req.body.userid);
        if (!req.body.userid) {
            return res.json(200, { err: 'userid required' });
        }
        APITradeService.getHistoryOrder(req.body.userid).then((result) => {
            res.json(200, result);
        }).catch((exception) => {
            sails.log.error('exception', exception);
            res.json(200, exception);
        })
    },
    getOrder: function (req, res) {
        sails.log.info('[TradeController.getOrder] start: userid ' + req.body.userid);
        if (!req.body.userid) {
            return res.json(200, { err: 'userid required' });
        }
        APITradeService.getOrder(req.body.userid).then((result) => {
            res.json(200, result);
        }).catch((exception) => {
            sails.log.error('exception', exception);
            res.json(200, exception);
        })
    },
    getBalance: function (req, res) {
        sails.log.info('[TradeController.getBalance] start: userid ' + req.body.userid);
        if (!req.body.userid) {
            return res.json(200, { err: 'userid required' });
        }
        APITradeService.getBalance(req.body.userid).then((result) => {
            console.log('[APITradeService.getBalance result]',result)
            res.json(200, result);
        }).catch((exception) => {
            sails.log.error('exception', exception);
            res.json(200, exception);
        })
    },
    fetchAssetTx: function (req, res) {
        sails.log.info('[TradeController.getTXHistory] start: userid ' + req.body.userid);
        if (!req.body.userid) {
            return res.json(200, { err: 'userid required' });
        }
        if (!req.body.asset) {
            return res.json(200, { err: 'asset required' });
        }
        if (!req.body.side) {
            return res.json(200, { err: 'side required' });
        }
        APITradeService.fetchAssetTx(req.body.userid, req.body.asset, req.body.side).then((result) => {
            res.json(200, result);
        }).catch((exception) => {
            res.json(200, exception);
        })
    },
    putlimit: function (req, res) {
        sails.log.info('[TradeController.putlimit] start: userid ' + req.body.userid + ' price: ' + req.body.price + ' amount: ' + req.body.amount + ' market: ' + req.body.market + ' side' + req.body.side);
        if (!req.body.userid) {
            return res.json(200, { err: 'userid required' });
        }
        if (!req.body.market) {
            return res.json(200, { err: 'market required' });
        }
        if (!req.body.side) {
            return res.json(200, { err: 'side required' });
        }
        if (!req.body.amount) {
            return res.json(200, { err: 'amount required' });
        }
        if (!req.body.price) {
            return res.json(200, { err: 'price required' });
        }
        APITradeService.putLimit(req.body.userid, req.body.market, req.body.side, req.body.amount, req.body.price).then((result) => {
            res.json(200, result);
        }).catch((exception) => {
            res.json(200, exception);
        })
    },
    cancel: function (req, res) {
        sails.log.info('[TradeController.cancel] start: userid ' + req.body.userid + ' market: ' + req.body.market + ' orderid : ' + req.body.orderid);
        if (!req.body.userid) {
            return res.json(200, { err: 'userid required' });
        }
        if (!req.body.market) {
            return res.json(200, { err: 'market required' });
        }
        if (!req.body.orderid) {
            return res.json(200, { err: 'orderid required' });
        }
        APITradeService.cancelOrder(req.body.userid, req.body.market, req.body.orderid).then((result) => {
            res.json(200, result);
        }).catch((exception) => {
            res.json(200, exception);
        })
    }
};

