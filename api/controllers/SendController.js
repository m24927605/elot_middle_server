module.exports = {
	findorCreateSendAddresses: function (req, res) {
		if (!req.body.userid) {
			return res.json(200, { err: 'userid required' });
		}
		if (!req.body.coin) {
			return res.json(200, { err: 'coin required' });
		}
		return WalletSendService.findorCreateSendAddresses(req.body.userid, req.body.coin).then((resp) => {
			return res.json(resp);
		});
	},
	updateSendAddresses: function (req, res) {
		if (!req.body.userid) {
			return res.json(200, { err: 'userid required' });
		}
		if (!req.body.coin) {
			return res.json(200, { err: 'coin required' });
		}
		if (!req.body.addressList) {
			return res.json(200, { err: 'addressList required' });
		}
		return WalletSendService.updateSendAddresses(req.body.userid, req.body.coin, req.body.addressList);
	},
	create: function (req, res) {
		sails.log.info('[SendController.create] start: userid ' + req.body.userid + ' assetname: ' + req.body.assetname + ' size: ' + req.body.size + ' address: ' + req.body.address);
		if (!req.body.userid) {
			return res.json(200, { err: 'userid required' });
		}
		if (!req.body.assetname) {
			return res.json(200, { err: 'assetname required' });
		}
		if (!req.body.size) {
			return res.json(200, { err: 'size required' });
		}
		if (!req.body.address) {
			return res.json(200, { err: 'address required' });
		}
		const sendObject = {};
		sendObject.timestamp = new Date().getTime();
		sendObject.userid = req.body.userid;
		sendObject.assetname = req.body.assetname;
		sendObject.address = req.body.address;
		sendObject.size = parseFloat(req.body.size);
		//WalletSendService.addSendObjectToSendMQ(sendObject).then((resp) => {
		WalletSendService.addSendObjectToPreSendMQ(sendObject).then((resp) => {
			return res.json(resp);
		});
	},
	emailConfirm: function (req, res) {
		sails.log.info('[SendController.emailConfirm] start: key: ' + req.query.key);
		if (!req.query.key) {
			return res.json(200, { err: 'key required' });
		}
		WalletSendService.emailConfirm(req.query.key).then((resp) => {
			return res.json(200, { resp });
		})
	},
};

