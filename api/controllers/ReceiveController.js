module.exports = {
	create: function (req, res) {
		sails.log.info('[ReceiveController.create] start: req.body.userid ' + req.body.userid + ' req.body.assetname: ' + req.body.assetname);
		if (!req.body.userid) {
			return res.json(200, { err: sails.config.constant.userid_required });
		}
		if (!req.body.assetname) {
			return res.json(200, { err: sails.config.constant.asset_name_required });
		}
		WalletUserService.getAccountByUserid(req.body.userid).then((account) => {
			if (account) {
				let receiveObject = { userid: req.body.userid, account: account, timestamp: new Date().getTime(), assetname: req.body.assetname };
				WalletReceiveService.addReceiveObjectToReceiveMQ(receiveObject);
				res.json({ state: sails.config.constant.submit_success });
			} else {
				res.json({ error: sails.config.constant.account_not_found });
			}
		});
	}
};

