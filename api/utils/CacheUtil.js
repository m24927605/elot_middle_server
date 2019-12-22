const NodeCache = require("node-cache");

const Cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });
const TxsCache = new NodeCache();
const CacheUtil = () => { };

CacheUtil.setTxs = function (address, coin, value) {
	return new Promise((resolve, reject) => {
		TxsCache.set(address + coin, value, function (err, success) {
			if (!err && success) {
				resolve(success);
			} else {
				reject(err);
			}
		});
	});
};

CacheUtil.getTxs = function (address, coin, ) {
	return new Promise(resolve => {
		const value = TxsCache.get(address + coin);
		resolve(value);
	});
};

CacheUtil.set = function (key, value) {
	return new Promise(resolve => {
		Cache.set(key, value, function (err, success) {
			if (!err && success) {
				resolve(success);
			} else {
				reject(err)
			}
		});
	});
};

CacheUtil.get = function (key) {
	return new Promise((resolve, reject) => {
		const value = Cache.get(key);
		resolve(value);
	});
};

module.exports = CacheUtil