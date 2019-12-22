module.exports = {
	getPrices: function (req, res) {
		WalletTransferService.getPrices().then((resp) => {
			res.send(resp);
		})
	},
	getTicker: function (req, res) {
		WalletTransferService.getTicker().then((resp) => {
			res.send(resp);
		})
	},

	qrcode: function (req, res) {
		sails.log.info('[TransferController.qrcode] start: req.body.address' + req.body.address);
		if (!req.body.address) {
			return res.json(200, { err: 'address required' });
		}
		WalletTransferService.qrcode(req.body.address).then((url) => {
			res.json(200, { img: url });
		})
	},

	btcbalance: function (req, res) {
		sails.log.info('[TransferController.btcbalance] start: req.body.address' + req.body.address);
		if (!req.body.address) {
			return res.json(200, { err: 'address required' });
		}
		WalletBalanceService.btc(req.body.address).then((balance) => {
			res.json(200, { balance: balance });
		})
	},

	tokenbalance: function (req, res) {
		sails.log.info('[TransferController.tokenbalance] start: req.body.address:' + req.body.address + ' req.body.tokenName:' + req.body.tokenName);
		if (!req.body.address) {
			return res.json(200, { err: 'address required' });
		}
		if (!req.body.tokenName) {
			return res.json(200, { err: 'tokenName required' });
		}
		WalletBalanceService.token(req.body.address, req.body.tokenName).then((balance) => {
			res.json(200, { balance: balance });
		})
	},

	ethbalance: function (req, res) {
		sails.log.info('[TransferController.ethbalance] start: req.body.address' + req.body.address);
		if (!req.body.address) {
			return res.json(200, { err: 'address required' });
		}
		WalletBalanceService.eth(req.body.address).then((balance) => {
			sails.log.info('[TransferController.ethbalance] end: response' + balance);
			res.json(200, { balance: balance });
		})
	},

	btctransaction: function (req, res) {
		sails.log.info('[TransferController.btctransaction] start: req.body.txid' + req.body.txid);
		if (!req.body.txid) {
			return res.json(200, { err: 'txid required' });
		}
		WalletTransferService.btcTransaction(req.body.txid).then((data) => {
			return res.json(200, { data: data });
		})
	},

	btctransfer: function (req, res) {
		sails.log.info('[TransferController.btctransfer] start: req.body.toaddress: ' + req.body.toaddress +
			' req.body.pk: *** ' + ' req.body.amounttosend: ' + req.body.amounttosend
			+ ' req.body.transactionfee: ' + req.body.transactionfee);

		if (!req.body.toaddress) {
			return res.json(200, { err: 'toaddress required' });
		}

		if (!req.body.pk) {
			return res.json(200, { err: 'pk required' });
		}

		if (!req.body.amounttosend) {
			return res.json(200, { err: 'amounttosend required' });
		}
		if (!req.body.transactionfee) {
			return res.json(200, { err: 'transactionfee required' });
		}
		WalletTransferService.btc(req.body.toaddress, req.body.amounttosend, req.body.pk, req.body.transactionfee).then((hash) => {
			return res.json(200, { hash: hash });
		}).catch((error) => {
			return res.json(200, error);
		})
	},
	
	tokentransfer: function (req, res) {
		sails.log.info('[TransferController.tokentransfer] start: req.body.to: '
			+ req.body.to + ' req.body.pk:***' + ' req.body.gasprice: '
			+ req.body.gasprice + ' req.body.amount: ' + req.body.amount +
			' req.body.tokenName' + req.body.tokenName);
		if (!req.body.to) {
			return res.json(200, { err: 'to required' });
		}
		if (!req.body.pk) {
			return res.json(200, { err: 'pk required' });
		}
		if (!req.body.gasprice) {
			return res.json(200, { err: 'gasprice required' });
		}
		if (!req.body.amount) {
			return res.json(200, { err: 'amount required' });
		}
		if (!req.body.tokenName) {
			return res.json(200, { err: 'tokenName required' });
		}
		WalletTransferService.token(req.body.to, req.body.pk, req.body.gasprice, req.body.amount, req.body.tokenName).then((txid) => {
			return res.json(200, { txid: txid });
		});
	},

	ethtransfer: function (req, res) {
		sails.log.info('[TransferController.ethtransfer] start: req.body.to: ' + req.body.to + ' req.body.pk:***'
			+ ' req.body.gasprice: ' + req.body.gasprice + ' req.body.amount: ' + req.body.amount);

		if (!req.body.to) {
			return res.json(200, { err: 'to required' });
		}

		if (!req.body.pk) {
			return res.json(200, { err: 'pk required' });
		}

		if (!req.body.gasprice) {
			return res.json(200, { err: 'gasprice required' });
		}

		if (!req.body.amount) {
			return res.json(200, { err: 'amount required' });
		}

		WalletTransferService.eth(req.body.to, req.body.pk, req.body.gasprice, req.body.amount).then((txid) => {
			return res.json(200, { txid: txid });
		}).catch((exception) => {
			return res.json(200, { error: exception });
		});
	}
};

