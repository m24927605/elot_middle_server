const DBUtil = () => { };
DBUtil.addSettlement = function (rec) {
    sails.log.info('[DBUtil.addSettlement] start: settlement ' + rec);
    return new Promise((resolve, reject) => {
        Settlement.create(rec).exec(function (err, records) {
            if (err) {
                reject({ err: err, res: "error" });
            } else {
                resolve(records);
            }
        });
    })
}
DBUtil.findorCreateSendAddresses = function (condition, send) {
    sails.log.info('[DBUtil.findSendAddresses] start: condition ' + JSON.stringify(condition) + ' send: ' + JSON.stringify(send));
    return new Promise((resolve, reject) => {
        Send.findOrCreate(condition, send).exec(function (err, record) {
            if (err) {
                reject({ err: err, res: "error" });
            } else {
                resolve(record);
            }
        });
    })
}
DBUtil.updateSendAddresses = function (condition, send) {
    sails.log.info('[DBUtil.updateSendAddresses] start: condition: ' + JSON.stringify(condition) + ' send: ' + JSON.stringify(send));
    return new Promise((resolve, reject) => {
        Send.update(condition, send).exec(function (err, records) {
            if (err) {
                reject({ err: err, res: 'error' });
            } else {
                resolve(records[0]);
            }
        });
    })
};
DBUtil.loadGasTankerTx = function (condition) {
    sails.log.info('[DBUtil.loadGasTankerTx] start: condition ' + condition);
    return new Promise((resolve, reject) => {
        GasTankerTx.find(condition).exec(function (err, records) {
            if (err) {
                reject({ err: err, res: "error" });
            } else {
                resolve(records);
            }
        });
    });
}
DBUtil.updateGasTankerTx = function (tx, status) {
    sails.log.info('[DBUtil.updateGasTankerTx] start: tx ' + JSON.stringify(tx) + ' status:' + JSON.stringify(status));
    return new Promise((resolve, reject) => {
        GasTankerTx.update(tx, status).exec(function (err, records) {
            if (err) {
                reject({ err: err, res: "error" });
            } else {
                resolve(records);
            }
        });
    })
}
DBUtil.createGasTankerTx = function (gasTankerTx) {
    sails.log.info('[DBUtil.createGasTankerTx] start: gasTankerTx ' + gasTankerTx);
    return new Promise((resolve, reject) => {
        GasTankerTx.create(gasTankerTx).exec(function (err, records) {
            if (err) {
                reject({ err: err, res: "error" });
            } else {
                resolve(records);
            }
        });
    })
}
DBUtil.loadAssetTx = function (condition) {
    sails.log.info('[DBUtil.loadAssetTx] start: condition ' + JSON.stringify(condition));
    return new Promise((resolve, reject) => {
        AssetTx.find(condition).exec(function (err, records) {
            if (err) {
                reject({ err: err, res: "error" });
            } else {
                resolve(records);
            }
        });
    })
}
DBUtil.createAssetTx = function (assetTx) {
    sails.log.info('[DBUtil.createAssetTx] start: assetTx ' + assetTx);
    return new Promise((resolve, reject) => {
        AssetTx.create(assetTx).exec(function (err, records) {
            if (err) {
                reject({ err: err, res: "error" });
            } else {
                resolve(records);
            }
        });
    })
}
DBUtil.updateAssetTx = function (tx, status) {
    sails.log.info('[DBUtil.updateAssetTx] start: tx: ' + JSON.stringify(tx) + ' status: ' + JSON.stringify(status));
    return new Promise((resolve, reject) => {
        AssetTx.update(tx, status).exec(function (err, records) {
            if (err) {
                reject({ err: err, res: 'error' });
            } else {
                resolve(records[0]);
            }
        });
    })
}
DBUtil.updateOrder = function (orderid, orderObj) {
    sails.log.info('[DBUtil.updateOrder] start: orderid: ' + orderid + ' orderObj: ' + orderObj);
    return new Promise((resolve, reject) => {
        Order.update({ orderid: String(orderid) }, orderObj).exec(function (err, records) {
            if (err) {
                reject({ err: err, res: 'error' });
            } else {
                resolve(records[0]);
            }
        });
    });
}

DBUtil.createOrder = function (order) {
    sails.log.info('[DBUtil.createOrder] start: order: ' + order);
    return new Promise((resolve, reject) => {
        Order.create(order)
            .exec(function (err, records) {
                if (err) {
                    reject({ err: err, res: "error" });
                } else {
                    resolve(records);
                }
            });
    });
}
DBUtil.findOrder = function (condition) {
    sails.log.info('[DBUtil.findOrder] start: condition: ' + JSON.stringify(condition));
    return new Promise((resolve, reject) => {
        Order.find(condition)
            .exec(function (err, records) {
                if (err) {
                    reject({ err: err, res: "error" });
                } else {
                    resolve(records);
                }
            });
    });
}

DBUtil.createTradeAssetHistory = function (assetHistory) {
    sails.log.info('[DBUtil.createTradeAssetHistory] start: assetHistory: ' + JSON.stringify(assetHistory));
    return new Promise((resolve, reject) => {
        TradeAssetHistory.create(assetHistory).exec(function (err, records) {
            if (err) {
                reject({ err: err, res: 'error' });
            } else {
                resolve(records);
            }
        });
    });
}
DBUtil.getTradeAssetHistory = function (condition) {
    sails.log.info('[DBUtil.getTradeAssetHistory] start: condition: ' + condition);
    return new Promise((resolve, reject) => {
        TradeAssetHistory.find(condition).exec(function (err, records) {
            if (err) {
                reject({ err: err, res: 'error' });
            } else {
                resolve(records);
            }
        });
    });
}
DBUtil.loadUserData = function (condition) {
    sails.log.info('[DBUtil.loadUserData] start: condition: ' + condition);
    return new Promise((resolve, reject) => {
        Users.find(condition).exec(function (err, records) {
            if (err) {
                reject({ err: err, res: 'error' });
            } else {
                resolve(records);
            }
        });
    });
}
DBUtil.findTradeAsset = function (userid) {
    sails.log.info('[DBUtil.findTradeAsset] start: userid: ' + userid);
    return new Promise((resolve, reject) => {
        TradeAsset.findOne({ userid }).exec(function (err, asset) {
            if (err) {
                reject(err);
            } else {
                resolve(asset);
            }
        });

    });
}
DBUtil.findAsset = function (userid) {
    sails.log.info('[DBUtil.findAsset] start: userid ' + userid);
    return new Promise((resolve, reject) => {
        Asset.findOne({ userid: userid }).exec(function (err, asset) {
            if (err) {
                reject(err);
            } else {
                resolve(asset);
            }
        });
    });
}
DBUtil.updateTradeAsset = function (userid, record) {
    sails.log.info('[DBUtil.updateTradeAsset] start: userid ' + userid + ' record:' + JSON.stringify(record));
    return new Promise((resolve, reject) => {
        TradeAsset.update({ userid: userid }, record).exec(function (err, records) {
            if (err) {
                reject({ err: err, res: 'error' });
            } else {
                resolve(records);
            }
        });
    });
}
DBUtil.updateAsset = function (userid, record) {
    sails.log.info('[DBUtil.updateAsset] start: userid ' + userid + ' record:' + JSON.stringify(record));
    return new Promise((resolve, reject) => {
        Asset.update({ userid: userid }, record).exec(function (err, records) {
            if (err) {
                reject({ err: err, res: 'error' });
            } else {
                resolve(records);
            }
        });
    });
}
DBUtil.createTradeAsset = function (asset) {
    sails.log.info('[DBUtil.createTradeAsset] start: asset ' + asset);
    return new Promise((resolve, reject) => {
        TradeAsset.create(asset).exec(function (err, records) {
            if (err) {
                reject({ err: err, res: 'error' });
            } else {
                resolve(records);
            }
        });
    });
}
DBUtil.createAsset = function (asset) {
    sails.log.info('[DBUtil.createAsset] start: asset ' + asset);
    return new Promise((resolve, reject) => {
        Asset.create(asset).exec(function (err, records) {
            if (err) {
                reject({ err: err, res: 'error' });
            } else {
                resolve(records);
            }
        });
    });
}
DBUtil.updateAssetHistory = function (id, record) {
    sails.log.info('[DBUtil.updateAssetHistory] start: id ' + id + ' record: ' + JSON.stringify(record));
    return new Promise((resolve, reject) => {
        AssetHistory.update({ id: id }, record).exec(function (err, records) {
            if (err) {
                reject({ err: err, res: 'error' });
            } else {
                resolve(records);
            }
        });
    });
}
DBUtil.createAssetHistory = function (assetHistory) {
    sails.log.info('[DBUtil.createAssetHistory] start: assetHistory: ' + JSON.stringify(assetHistory));
    return new Promise((resolve, reject) => {
        AssetHistory.create(assetHistory).exec(function (err, records) {
            if (err) {
                reject({ err: err, res: 'error' });
            } else {
                resolve(records);
            }
        });
    });
}
DBUtil.createConfig = function (config) {
    sails.log.info('[DBUtil.createConfig] start: createConfig: coin ' + config.coin);
    return new Promise((resolve, reject) => {
        Config.findOrCreate({ coin: config.coin }, config).exec(function (err, createdRecords) {
            if (err) {
                reject({ err: err, res: 'DBUtil.createConfig error' });
            } else {
                resolve(createdRecords);
            }
        });
    });
}
DBUtil.loadConfig = function (coin) {
    sails.log.info('[DBUtil.loadConfig] start: coin:' + coin);
    return new Promise((resolve, reject) => {
        Config.find({ coin }).exec(function (err, records) {
            if (err) {
                reject({ err: err, res: 'DBUtil.loadConfig error' });
            } else {
                resolve(records);
            }
        });
    });
}
DBUtil.updateConfig = function (coin, update) {
    sails.log.info('[DBUtil.updateConfig] start: coin: ' + coin + ' update:' + JSON.stringify(update));
    return new Promise((resolve, reject) => {
        Config.update({ coin }, update).exec(function (err, updated) {
            if (err) {
                reject({ err: err, res: 'error' });
            } else {
                resolve(updated);
            }
        });
    });
}
DBUtil.loadAssets = function (condition) {
    sails.log.info('[DBUtil.loadAssets] start: condition ' + JSON.stringify(condition));
    return new Promise((resolve, reject) => {
        TradeAsset.find(condition).exec(function (err, records) {
            if (err) {
                reject({ err: err, res: 'DBUtil.loadAssets error' });
            } else {
                records.forEach(asset => {
                    delete asset.createdAt;
                    delete asset.updatedAt;
                    delete asset.id;
                });
                resolve(records);
            }
        });
    });
}
DBUtil.getAssetsCount = function (condition) {
    sails.log.info('[DBUtil.getAssetsCounts] start: condition ' + JSON.stringify(condition));
    return new Promise((resolve, reject) => {
        TradeAsset.count(condition).exec(function (err, cnt) {
            if (err) {
                reject({ err: err, res: 'DBUtil.getAssetsCount error' });
            } else {
                resolve(cnt);
            }
        });
    });
}
DBUtil.testDelete = function (userid) {
    AssetHistory.destroy({ userid: userid }).exec(function (err) { });
    Users.destroy({ userid: userid }).exec(function (err) { });
    Asset.destroy({ userid: userid }).exec(function (err) { });
    AssetTx.destroy({ userid: userid }).exec(function (err) { });
    TradeAsset.destroy({ userid: userid }).exec(function (err) { });
    TradeAssetHistory.destroy({ userid: userid }).exec(function (err) { });
}
module.exports = DBUtil;