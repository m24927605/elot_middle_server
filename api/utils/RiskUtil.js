const DBUtil = require('./DBUtil');
const commonUtil = require('../utils/CommonUtil');
const _ = require('lodash');
const riskUtil = () => { };
riskUtil.caculateTotalAssets = () => {
	sails.log.info('[riskUtil.caculateTotalAssets] start: ');
	return new Promise((resolve, reject) => {
		try {
			const total = {};
			DBUtil.loadAssets({}).then((records) => {
				records.forEach(rec => {
					for (let key in rec) {
						if (String(key).endsWith(sails.config.constant.vailable_flag) || String(key).endsWith(sails.config.constant.frozen_flag)) {
							if (!total[key]) {
								total[key] = rec[key];
							} else {
								total[key] = total[key] + rec[key];
							}
						}
					}
				});
				sails.config.globals.totalAsset = total;
				resolve(total);
			})
		} catch (error) {
			reject(error);
		}
	});
}

riskUtil.checkUser = async (userid) => {
	sails.log.info('[riskUtil.checkUser] start: userid' + userid);
	const balance = await DBUtil.findTradeAsset(userid);
	const assetHistory = await DBUtil.getTradeAssetHistory({ userid });
	return riskUtil.analyseUserInfo(riskUtil.processBalance(balance), riskUtil.processAssetHistory(assetHistory));
}

riskUtil.analyseUserInfo = (balance, assetHistory) => {
	sails.log.info('[riskUtil.analyseUserInfo] start: balance ' + JSON.stringify(balance) + ' assetHistory ' + JSON.stringify(assetHistory));
	if (!assetHistory || !balance) {
		return false;
	}
	let resFlag = true;
	const depositHistory = _.groupBy(assetHistory.deposit, (rec) => rec.asset);
	const withdrawHistory = _.groupBy(assetHistory.withdraw, (rec) => rec.asset);
	const inHistory = _.groupBy(assetHistory.in, (rec) => rec.asset);
	const outHistory = _.groupBy(assetHistory.out, (rec) => rec.asset);
	_.forEach(balance, (value) => {
		const caluclatedBalance = riskUtil.analyseCoin(String(value.coin).toUpperCase(), depositHistory, withdrawHistory, inHistory, outHistory);
		if (String(caluclatedBalance) !== commonUtil.add(value.available, value.frozen).toString()) {
			resFlag = false;
		}
	})
	sails.log.info('[riskUtil.analyseUserInfo] end: resFlag: ' + resFlag);
	return resFlag;
}

riskUtil.analyseCoin = (coin, depositHistory, withdrawHistory, inHistory, outHistory) => {
	sails.log.info('[riskUtil.analyseCoin] start: depositHistory ' + JSON.stringify(depositHistory)
		+ 'withdrawHistory' + JSON.stringify(withdrawHistory)
		+ 'inHistory' + JSON.stringify(inHistory)
		+ 'outHistory' + JSON.stringify(outHistory));
	let calculatedBalance = '0';
	if (depositHistory[coin] && depositHistory[coin].length > 0) {
		_.forEach(depositHistory[coin], deposit => {
			if (deposit.amount) {
				calculatedBalance = commonUtil.add(String(calculatedBalance), deposit.amount);
			}
		});
	}

	if (inHistory[coin] && inHistory[coin].length > 0) {
		_.forEach(inHistory[coin], inAsset => {
			if (inAsset.amount) {
				calculatedBalance = commonUtil.add(String(calculatedBalance), inAsset.amount);
				calculatedBalance = commonUtil.subtract(String(calculatedBalance), inAsset.fee);
			}
		});
	}

	if (outHistory[coin] && outHistory[coin].length > 0) {
		_.forEach(outHistory[coin], outAsset => {
			if (outAsset.amount) {
				calculatedBalance = commonUtil.subtract(String(calculatedBalance), outAsset.amount);
				calculatedBalance = commonUtil.subtract(String(calculatedBalance), outAsset.fee);
			}
		});
	}

	if (withdrawHistory[coin] && withdrawHistory[coin].length > 0) {
		_.forEach(withdrawHistory[coin], withdraw => {
			if (withdraw.amount) {
				calculatedBalance = commonUtil.subtract(String(calculatedBalance), withdraw.amount);
			}
		});
	}
	return String(calculatedBalance);
}
riskUtil.processBalance = (balance) => {
	sails.log.info('[riskUtil.processBalance] start: balance ' + JSON.stringify(balance));
	const balanceRes = [];
	const balanceObj = {};
	_.forEach(balance, (value, key) => {

		if (!key.endsWith(sails.config.constant.vailable_flag) && !key.endsWith(sails.config.constant.frozen_flag)) {
			return;
		}
		let coin, coinkey;
		key.endsWith(sails.config.constant.vailable_flag) ? coin = key.replace(sails.config.constant.vailable_flag, '') : coin = key.replace(sails.config.constant.frozen_flag, '');
		key.endsWith(sails.config.constant.vailable_flag) ? coinkey = sails.config.constant.vailable_flag : coinkey = sails.config.constant.frozen_flag;
		if (!balanceObj[coin]) {
			balanceObj[coin] = {};
		}
		balanceObj[coin][coinkey] = value;
	});

	_.forEach(balanceObj, (value, key) => {
		const rec = { coin: key, available: value.Available, frozen: value.Frozen }
		balanceRes.push(rec);
	});
	return balanceRes;
}
riskUtil.processAssetHistory = (assetHistorys) => {
	sails.log.info('[riskUtil.processAssetHistory] start: assetHistorys ' + JSON.stringify(assetHistorys));
	if (!assetHistorys || assetHistorys.length === 0) {
		return;
	}
	const userAsset = {}

	userAsset.deposit = _.filter(assetHistorys, (record) => {
		return String(record.side) === String(sails.config.asset.trade_assets_history_side_deposit);
	});

	userAsset.withdraw = _.filter(assetHistorys, (record) => {
		return String(record.side) === String(sails.config.asset.trade_assets_history_side_withdraw);
	});

	userAsset.in = _.filter(assetHistorys, (record) => {
		return String(record.inout) === String(sails.config.asset.trade_assets_history_in);
	});

	userAsset.out = _.filter(assetHistorys, (record) => {
		return String(record.inout) === String(sails.config.asset.trade_assets_history_out);
	});

	return userAsset;
}

module.exports = riskUtil