module.exports = {
    getFrontConfig: function(req,res){
        res.json(APIAdminService.getFrontConfig());
    },
    getConfig: function (req, res) {
        APIAdminService.fetchConfigs().then((config) => {
            res.json({ config: config });
        });
    },
    pairs: function (req, res) {
        res.json({ pairs: sails.config.trader.pairs });
    },
    getConfigs: function (req, res) {
        if (!req.body.coin) {
            return res.json(400, { err: 'coin required' });
        }
        APIAdminService.getConfig(req.body.coin).then((config) => {
            res.json(200, { config: config });
        });
    },
    updateConfig: function (req, res) {
        if (!req.body.coin) {
            return res.json(400, { err: 'coin required' });
        }
        const updateConfig = APIAdminService.getConfigEntity(req.body);
        APIAdminService.updateConfig(req.body.coin, updateConfig).then((config) => {
            res.json(200, { config: config });
        });
    },
    createConfig: function (req, res) {
        if (!req.body.coin) {
            return res.json(400, { err: 'coin required' });
        }
        if (!req.body.confirmBlockNumer) {
            return res.json(400, { err: 'confirmBlockNumer required' });
        }

        if (!req.body.inAddress) {
            return res.json(400, { err: 'inAddress required' });
        }

        if (!req.body.inEncryptedPK) {
            return res.json(400, { err: 'inEncryptedPK required' });
        }

        if (!req.body.outEncryptedPK) {
            return res.json(400, { err: 'outEncryptedPK required' });
        }

        if (!req.body.outAddress) {
            return res.json(400, { err: 'outAddress required' });
        }

        if (!req.body.receiveThreshold) {
            return res.json(400, { err: 'receiveThreshold required' });
        }

        if (!req.body.sendThreshold) {
            return res.json(400, { err: 'sendThreshold required' });
        }
        if (!req.body.receiveTransferFee) {
            return res.json(400, { err: 'receiveTransferFee required' });
        }
        if (!req.body.sendTransferFee) {
            return res.json(400, { err: 'sendTransferFee required' });
        }
        const newConfig = APIAdminService.getConfigEntity(req.body);
        APIAdminService.createConfig(newConfig).then((config) => {
            res.json(200, { config: config });
        });
    }

};

