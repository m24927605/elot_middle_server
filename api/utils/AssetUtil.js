
let RedisUtil = require('../utils/RedisUtil');
let DBUtil = require('../utils/DBUtil');
let CommonUtil = require('../utils/CommonUtil');
var AssetUtil = function () { }
AssetUtil.updateGasTankerTXInRedis = function (txid, gasTankerTX) {
	sails.log.info('[AssetUtil.updateGasTankerTXInRedis] start : txid ' + txid + ' gasTankerTX: ' + JSON.stringify(gasTankerTX));
	return new Promise((resolve, reject) => {
		if (txid == null || txid == undefined || txid == "undefined" || txid == "null") {
			return reject({ err: 'txid_null' });
		}
		if (gasTankerTX == null || gasTankerTX == undefined || gasTankerTX == "undefined" || gasTankerTX == "null") {
			return reject({ err: 'gasTankerTX_null' });
		}
		RedisUtil.hset(sails.config.redis.gas_tanker_hashkey, txid, JSON.stringify(gasTankerTX)).then((resp) => {
			resolve(resp);
		});
	});
}
AssetUtil.createGasTankerTX = function (userid, asset, size, status, tx) {
	sails.log.info('[AssetUtil.createGasTankerTX] start: userid ' + userid + ' asset: ' + asset + ' size: ' + size + ' status: ' + status + ' tx: ' + tx);
	var gasTankerTx = {};
	gasTankerTx.userid = userid;
	gasTankerTx.asset = asset;
	gasTankerTx.size = size;
	gasTankerTx.status = status;
	gasTankerTx.tx = tx;
	return DBUtil.createGasTankerTx(gasTankerTx);
}

AssetUtil.updateGasTankerTx = function (tx, status) {
	sails.log.info('[AssetUtil.updateGasTankerTx] start: tx: ' + tx + ' status: ' + status);
	return DBUtil.updateGasTankerTx({ tx: tx }, { status: status });
}

AssetUtil.loadGasTankerTx = function (condition) {
	sails.log.info('[AssetUtil.updateGasTankerTx] start: condition: ' + condition);
	return DBUtil.loadGasTankerTx(condition);
}

AssetUtil.getNounce = function (address) {
	sails.log.info('[AssetUtil.getNounce] start: address ' + address);
	return new Promise((resolve, reject) => {
		try {
			RedisUtil.hget(sails.config.redis.address_send_locked_hashkey + '_nounce', address).then((nounce) => {
				resolve(nounce);
			});
		} catch (error) {
			reject(error);
		}
	});
}

AssetUtil.setNounce = function (address, nounce) {
	sails.log.info('[AssetUtil.setNounce] start: address ' + address + ' nounce: ' + nounce);
	return new Promise((resolve, reject) => {
		RedisUtil.hset(sails.config.redis.address_send_locked_hashkey + '_nounce', address, nounce).then((resp) => {
			resolve(resp);
		});
	});
}

AssetUtil.setReceiveAddressStatus = function (address, flag) {
	sails.log.info('[AssetUtil.setReceiveAddressStatus] start : address ' + address + ' flag: ' + flag);
	return new Promise((resolve, reject) => {
		if (address == null || address == undefined || address == "undefined" || address == "null") {
			return { err: 'address_null' };
		}
		if (flag == null || flag == undefined || flag == "undefined" || flag == "null") {
			return { err: 'flag_null' };
		}
		RedisUtil.hset(sails.config.redis.address_receive_locked_hashkey, address, flag).then((resp) => {
			resolve(resp);
		});
	});
}

AssetUtil.getReceiveAddressStatus = function (address) {
	return new Promise((resolve, reject) => {
		sails.log.info('[AssetUtil.getReceiveAddressStatus] start : address ' + address);
		RedisUtil.hget(sails.config.redis.address_receive_locked_hashkey, address).then((flag) => {
			resolve(flag);
		});
	});
}

AssetUtil.getAllAssetHistoryFromRedis = function (hashkey) {
	sails.log.info('[AssetUtil.getAllAssetHistoryFromRedis] start : hashkey ' + hashkey);
	if (hashkey == null || hashkey == undefined || hashkey == "undefined" || hashkey == "null") {
		return { err: 'hashkey_null', hashkey: hashkey };
	}
	return RedisUtil.hkeys(hashkey);
}

AssetUtil.updateAssetHistory = function (id, state) {
	sails.log.info('[AssetUtil.updateAssetHistory] start : id ' + id + ' state: ' + state);
	return DBUtil.updateAssetHistory(id, { state: state })
}

AssetUtil.updateAssetSend = function (userid, asset, assetAvailableName) {
	sails.log.info('[AssetUtil.updateAssetSend] start : userid ' + userid + ' asset: ' + asset + ' assetAvailableName: ' + assetAvailableName);
	return new Promise((resolve, reject) => {
		DBUtil.findAsset(userid).then((record) => {
			if (record == undefined || record == 'undefined') {
				reject('asset_record_not_found')
			} else {
				if (asset && asset[assetAvailableName]) {
					record[assetAvailableName] = CommonUtil.subtract(record[assetAvailableName], asset[assetAvailableName]);
				}
				DBUtil.updateAsset(userid, record).then((result) => {
					resolve(result);
				}).catch((err) => {
					sails.log.error("err", err);
				});
			}
		})
	})
}

AssetUtil.updateAssetReceive = function (userid, asset, assetAvailableName) {
	sails.log.info('[AssetUtil.updateAssetReceive] start : userid ' + userid + ' asset: ' + asset + ' assetAvailableName: ' + assetAvailableName);
	return new Promise((resolve, reject) => {
		DBUtil.findAsset(userid).then((record) => {
			if (record == undefined || record == 'undefined') {
				DBUtil.createAsset(asset).then((result) => {
					resolve(result);
				});
			} else {
				if (asset && asset[assetAvailableName]) {
					record[assetAvailableName] = CommonUtil.add(record[assetAvailableName], asset[assetAvailableName]);
				}
				DBUtil.updateAsset(userid, record).then((result) => {
					resolve(result);
				}).catch((err) => {
					sails.log.error("err", err);
				});
			}
		})
	})
}

AssetUtil.createAsset = function (userid) {
	sails.log.info('[AssetUtil.createAsset] start : userid ' + userid);
	return DBUtil.createAsset({ userid: userid });
}

AssetUtil.initAssetHistoryUnchecked = function (userid, asset, amount, txid, side, state) {
	sails.log.info('[AssetUtil.initAssetHistoryUnchecked] start : userid ' + userid + ' asset : ' + asset + ' amount: ' + amount + ' txid: ' + txid + ' side:  ' + side + ' state:  ' + state);
	if (userid == null || userid == undefined || userid == 'undefined' || userid == 'null') {
		return { err: 'userid_null' };
	}
	if (asset == null || asset == undefined || asset == 'undefined' || asset == 'null') {
		return { err: 'asset_null' };
	}
	if (amount == null || amount == undefined || amount == 'undefined' || amount == 'null') {
		return { err: 'amount_null' };
	}
	if (txid == null || txid == undefined || txid == 'undefined' || txid == 'null') {
		return { err: 'amount_null' };
	}
	if (side == null || side == undefined || side == 'undefined' || side == 'null') {
		return { err: 'side_null' };
	}
	if (state == null || state == undefined || state == 'undefined' || state == 'null') {
		return { err: 'state_null' };
	}
	var assetHistoryRecord = {};
	assetHistoryRecord.userid = userid;
	assetHistoryRecord.asset = asset;
	assetHistoryRecord.amount = parseFloat(amount);
	assetHistoryRecord.timestamp = new Date().getTime();
	assetHistoryRecord.txid = txid;
	assetHistoryRecord.side = side;
	assetHistoryRecord.state = state;
	return DBUtil.createAssetHistory(assetHistoryRecord);
}

AssetUtil.updateAssetInRedis = function (userid, asset) {
	sails.log.info('[AssetUtil.updateAssetInRedis] start : userid ' + userid + ' asset: ' + JSON.stringify(asset));
	return new Promise((resolve, reject) => {
		if (userid == null || userid == undefined || userid == "undefined" || userid == "null") {
			reject({ err: 'userid_null' });
			return;
		}
		if (asset == null || asset == undefined || asset == "undefined" || asset == "null") {
			reject({ err: 'asset_null' });
			return;
		}
		RedisUtil.hset(sails.config.redis.asset_redis_hashkey, userid, JSON.stringify(asset)).then((flag) => {
			resolve(flag);
		});
	});
}

AssetUtil.updateAssetHistoryInRedis = function (userid, assetHistory, assetHistoryDate, flag) {
	sails.log.info('[AssetUtil.updateAssetHistoryInRedis] start : userid ' + userid + ' assetHistoryDate: ' + assetHistoryDate + ' assetHistory: ' + JSON.stringify(assetHistory));
	return new Promise((resolve, reject) => {
		if (userid == null || userid == undefined || userid == "undefined" || userid == "null") {
			reject({ err: 'userid_null' });
			return;
		}
		if (assetHistory == null || assetHistory == undefined || assetHistory == "undefined" || assetHistory == "null") {
			reject({ err: 'assetHistory_null' });
			return;
		}
		if (flag == null || flag == undefined || flag == "undefined" || flag == "null") {
			reject({ err: 'flag_null' });
			return;
		}
		if (assetHistoryDate == null || assetHistoryDate == undefined || assetHistoryDate == "undefined" || assetHistoryDate == "null") {
			reject({ err: 'assetHistoryDate_null' });
			return;
		}
		RedisUtil.hset(sails.config.redis.asset_history_redis_hashkey + '_' + userid, JSON.stringify(assetHistory), flag).then((resp1) => {
			RedisUtil.hset(sails.config.redis.asset_history_redis_hashkey + '_' + assetHistoryDate, JSON.stringify(assetHistory), flag).then((resp2) => {
				resolve(resp2);
			});
		});
	});
}

AssetUtil.getAssetHistoryFromRedis = function (hashkey, field) {
	sails.log.info('[AssetUtil.getAssetHistoryFromRedis] start : hashkey ' + hashkey + ' field: ' + field);
	return new Promise((resolve, reject) => {
		if (hashkey == null || hashkey == undefined || hashkey == "undefined" || hashkey == "null") {
			reject({ err: 'hashkey_null' });
			return;
		}
		if (field == null || field == undefined || field == "undefined" || field == "null") {
			reject({ err: 'field_null' });
			return;
		}
		RedisUtil.hget(hashkey, field).then((flag) => {
			resolve(flag);
		});
	});
}

module.exports = AssetUtil;