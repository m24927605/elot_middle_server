module.exports = {
    transfer: function (req, res) {
        if (!req.body.from) {
            return res.json(200, { err: 'from required' });
        }
        if (!req.body.to) {
            return res.json(200, { err: 'to required' });
        }
        if (!req.body.asset) {
            return res.json(200, { err: 'asset required' });
        }
        if (!req.body.size) {
            return res.json(200, { err: 'size required' });
        }
        APISettlement.transfer(req.body.from, req.body.to, req.body.asset, req.body.size).then(resp => {
            res.status(200).json(resp)
        });
    },
    settleCommission: function (req, res) {
        if (!req.body.userid) {
            return res.json(200, { err: 'userid required' });
        }
        if (!req.body.asset) {
            return res.json(200, { err: 'asset required' });
        }
        if (!req.body.size) {
            return res.json(200, { err: 'size required' });
        }
       
        APISettlement.settleCommission(req.body.userid, req.body.asset, req.body.size).then(resp => {
            res.status(200).json(resp)
        });
    
    },
    exchangeGBAsset: function (req, res) {
        if (!req.body.userid) {
            return res.json(200, { err: 'userid required' });
        }

        if (!req.body.size) {
            return res.json(200, { err: 'size required' });
        }

        if (!req.body.price) {
            return res.json(200, { err: 'price required' });
        }

        if (!req.body.asset) {
            return res.json(200, { err: 'asset required' });
        }

        if (!req.body.money) {
            return res.json(200, { err: 'money required' });
        }

        APISettlement.exchangeGBAsset(
            req.body.userid,
            req.body.money,
            req.body.asset,
            req.body.size,
            req.body.price
        ).then(resp => {
            res.status(200).json(resp)
        });
    },

    putGBOrder: function (req, res) {
        if (!req.body.userid) {
            return res.json(200, { err: 'userid required' });
        }
        if (!req.body.size) {
            return res.json(200, { err: 'size required' });
        }
        if (!req.body.asset) {
            return res.json(200, { err: 'asset required' });
        }
        APISettlement.putGBOrder(req.body.asset, req.body.size, req.body.userid).then(resp => {
            res.status(200).json(resp)
        });
    },
    
    settleGBOrder: function (req, res) {
        if (!req.body.userid) {
            return res.json(200, { err: 'userid required' });
        }
        if (!req.body.asset) {
            return res.json(200, { err: 'asset required' });
        }
        if (!req.body.orderSize) {
            return res.json(200, { err: 'orderSize required' });
        }
        if (!req.body.winSize && req.body.winSize !== 0) {
            return res.json(200, { err: 'winSize required' });
        }
        APISettlement.settleGBOrder(req.body.userid, req.body.asset, req.body.orderSize, req.body.winSize).then(resp => {
            res.status(200).json(resp)
        });
    }
};

