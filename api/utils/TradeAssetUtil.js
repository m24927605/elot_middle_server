const RedisUtil = require('../utils/RedisUtil');
const DBUtil = require('../utils/DBUtil');
const CommonUtil = require('../utils/CommonUtil');
const MQUtil = require('../utils/MQUtil');
const TradeAssetUtil = () => { };
TradeAssetUtil.transfer = async (from,to,asset,size) =>{
  sails.log.info(`[TradeAssetUtil.transfer] from:${from} to:${to} asset:${asset} size:${size}`);
  const result = {};
  const fromAsset = await DBUtil.findTradeAsset(from);
  const toAsset = await DBUtil.findTradeAsset(to);
  fromAsset[`${String(asset).toLowerCase()}Available`] = CommonUtil.subtract(fromAsset[`${String(asset).toLowerCase()}Available`],size);
  toAsset[`${String(asset).toLowerCase()}Available`] = CommonUtil.add(toAsset[`${String(asset).toLowerCase()}Available`],size);
  const fromRes = await DBUtil.updateTradeAsset(from, fromAsset);
  const toRes = await DBUtil.updateTradeAsset(to, toAsset);
  result.from = fromRes[0];
  await TradeAssetUtil.updateTradeAssetInRedis(String(result.from.userid), result.from);
  result.to = toRes[0];
  await TradeAssetUtil.updateTradeAssetInRedis(String(result.to.userid), result.to);
  return result;
}

TradeAssetUtil.exchangeBalanceHistory = async (userid, asset, amount, inout, state, side, detail) => {
  sails.log.info(
    '[TradeAssetUtil.exchangeBalanceHistory] start : userid ' + userid
    + ' asset: ' + asset
    + ' amount: ' + amount
    + ' inout: ' + inout
    + ' detail: ' + JSON.stringify(detail)
    + ' side: ' + side
  );
  if (userid === null || userid === undefined) {
    return { err: 'userid_null' };
  }
  if (asset === null || asset === undefined) {
    return { err: 'asset_null' };
  }
  if (amount === null || amount === undefined) {
    return { err: 'amount_null' };
  }
  const assetHistoryRecord = {};
  assetHistoryRecord.userid = userid;
  assetHistoryRecord.asset = asset;
  assetHistoryRecord.amount = parseFloat(amount);
  assetHistoryRecord.timestamp = new Date().getTime();
  assetHistoryRecord.side = side;
  assetHistoryRecord.fee = '0';
  assetHistoryRecord.detail = detail;
  assetHistoryRecord.state = state;
  assetHistoryRecord.inout = inout;
  const tradeAssetHistory = await DBUtil.createTradeAssetHistory(assetHistoryRecord);
  return tradeAssetHistory;
};

TradeAssetUtil.exchangeBalance = (userid, asset, assetAdd, assetMinus) => {
  sails.log.info('[TradeAssetUtil.exchangeBalance] start userid: '
    + userid + ' asset: ' + JSON.stringify(asset) +
    ' assetAdd: ' + assetAdd + ' assetMinus:' + assetMinus);
  return new Promise((resolve, reject) => {
    DBUtil.findTradeAsset(userid).then((record) => {
      if (record === undefined || record === null) {
        DBUtil.createTradeAsset(asset).then((result) => {
          return reject({ error: `not user trade asset record ${result}` });
        });
      } else if (asset && asset[assetAdd] && asset[assetMinus]) {
        record[assetAdd] = CommonUtil.add(record[assetAdd], asset[assetAdd]);
        record[assetMinus] = CommonUtil.subtract(record[assetMinus], asset[assetMinus]);
        if (parseFloat(record[assetMinus]) < 0) {
          console.log('[here1]')
          return reject({ error: `balance not enough` });
        } else {
          DBUtil.updateTradeAsset(userid, record).then((result) => {
            return resolve(result[0]);
          }).catch((err) => {
            sails.log.error("err", err);
          });
        }
      } else {
        return reject({ error: `asset param or user record error` });
      }
    });
  });
};

TradeAssetUtil.putGBOrder = (userid, asset, assetFrozenName, assetAvailableName) => TradeAssetUtil.updateTradeAssetPutLimit(userid, asset, assetFrozenName, assetAvailableName);

TradeAssetUtil.settleCommission = async(userid, asset, coin, assetAvailableName, amount, side, state, inout, detail) => {
  sails.log.info('[TradeAssetUtil.settleCommission] start userid: ' + userid
    + ' asset: ' + JSON.stringify(asset)
    + ' coin: ' + coin
    + ' assetAvailableName:' + assetAvailableName
    + ' amount:' + amount
    + ' side:' + side
    + ' state:' + state
    + ' inout:' + inout
    + ' detail:' + detail
  );

  try {
    const result = {};
    const record = await DBUtil.findTradeAsset(String(userid));
    sails.log.info(`[TradeAssetUtil.settleGBOrder] record ${JSON.stringify(record)}`);
    if (record == undefined || record == 'undefined' || record == null || record == 'null') {
      return { error: "system_error_userid_notfound" };
    }

    if (asset && asset[assetAvailableName]) {
      record[assetAvailableName] = CommonUtil.add(record[assetAvailableName], asset[assetAvailableName]);
      if (parseFloat(record[assetAvailableName]) < 0) {
        console.log('[here2]')
        return { error: "balance not enough" };
      } else {
        const tradeAsset = await DBUtil.updateTradeAsset(String(userid), record);
        sails.log.info(`[TradeAssetUtil.settleCommission] tradeAsset ${JSON.stringify(tradeAsset)}`);
        result.tradeAsset = tradeAsset[0];
        if (result.tradeAsset && result.tradeAsset.userid) {
          await TradeAssetUtil.updateTradeAssetInRedis(String(userid), result.tradeAsset);
          const assetHistoryRecord = {};
          assetHistoryRecord.userid = userid;
          assetHistoryRecord.asset = coin;
          assetHistoryRecord.amount = parseFloat(amount);
          assetHistoryRecord.timestamp = new Date().getTime();
          assetHistoryRecord.side = side;
          assetHistoryRecord.fee = '0';
          assetHistoryRecord.detail = detail;
          assetHistoryRecord.state = state;
          assetHistoryRecord.inout = inout;
          const tradeAssetHistory = await DBUtil.createTradeAssetHistory(assetHistoryRecord);
          sails.log.info(`[TradeAssetUtil.settleCommission] tradeAssetHistory ${JSON.stringify(tradeAssetHistory)}`);
          result.tradeAssetHistory = tradeAssetHistory;
          return result;
        }
      }
    }

  } catch (error) {
    sails.log.error(`[TradeAssetUtil.settleCommission] ${JSON.stringify(error)}`);
    return error;
  }
};


TradeAssetUtil.settleGBOrder = async (userid, asset, coin, assetFrozenName, assetAvailableName, amount, side, state, inout, detail) => {
  sails.log.info('[TradeAssetUtil.settleGBOrder] start userid: ' + userid
    + ' asset: ' + JSON.stringify(asset)
    + ' coin: ' + coin
    + ' assetFrozenName:' + assetFrozenName
    + ' assetAvailableName:' + assetAvailableName
    + ' amount:' + amount
    + ' side:' + side
    + ' state:' + state
    + ' inout:' + inout
    + ' detail:' + detail
  );
  try {
    const result = {};
    const record = await DBUtil.findTradeAsset(String(userid));
    sails.log.info(`[TradeAssetUtil.settleGBOrder] record ${JSON.stringify(record)}`);
    if (record == undefined || record == 'undefined' || record == null || record == 'null') {
      return { error: "system_error_userid_notfound" };
    }

    if (asset && asset[assetAvailableName]) {
      record[assetAvailableName] = CommonUtil.add(record[assetAvailableName], asset[assetAvailableName]);
    }

    if (asset && asset[assetFrozenName]) {
      record[assetFrozenName] = CommonUtil.subtract(record[assetFrozenName], asset[assetFrozenName]);
      if (parseFloat(record[assetFrozenName]) < 0) {
        console.log('[here3]')
        return { error: "balance not enough" };
      } else {
        const tradeAsset = await DBUtil.updateTradeAsset(String(userid), record);
        sails.log.info(`[TradeAssetUtil.settleGBOrder] tradeAsset ${JSON.stringify(tradeAsset)}`);
        result.tradeAsset = tradeAsset[0];
        if (result.tradeAsset && result.tradeAsset.userid) {
          await TradeAssetUtil.updateTradeAssetInRedis(String(userid), result.tradeAsset);
          const assetHistoryRecord = {};
          assetHistoryRecord.userid = userid;
          assetHistoryRecord.asset = coin;
          assetHistoryRecord.amount = parseFloat(amount);
          assetHistoryRecord.timestamp = new Date().getTime();
          assetHistoryRecord.side = side;
          assetHistoryRecord.fee = '0';
          assetHistoryRecord.detail = detail;
          assetHistoryRecord.state = state;
          assetHistoryRecord.inout = inout;
          const tradeAssetHistory = await DBUtil.createTradeAssetHistory(assetHistoryRecord);
          sails.log.info(`[TradeAssetUtil.settleGBOrder] tradeAssetHistory ${JSON.stringify(tradeAssetHistory)}`);
          result.tradeAssetHistory = tradeAssetHistory;
          return result;
        }
      }
    }
  } catch (error) {
    sails.log.error(`[TradeAssetUtil.settleGBOrder] ${JSON.stringify(error)}`);
    return error;
  }
};

TradeAssetUtil.getAssetsCount = function () {
  sails.log.info('[TradeAssetUtil.getAssetsCount] start: ');
  return DBUtil.getAssetsCount({});
};

TradeAssetUtil.loadAssets = function (skip, limit) {
  sails.log.info('[TradeAssetUtil.loadAssets] start: skip ' + skip + ' limit ' + limit);
  return DBUtil.loadAssets({ sort: 'updatedAt DESC', skip, limit });
};

TradeAssetUtil.loadAssetUTXO = function (asset) {
  sails.log.info('[TradeAssetUtil.loadAssetUTXO] start: asset ' + asset);
  return DBUtil.loadAssetTx({ asset, status: sails.config.asset.tx_submitted });
};

TradeAssetUtil.loadAssetTx = function (userid, asset, side) {
  sails.log.info('[TradeAssetUtil.loadAssetTx] start: userid ' + userid + ' asset: ' + asset + ' side:' + side);
  return DBUtil.loadAssetTx({ userid, asset, side, sort: 'updatedAt DESC' })
}
TradeAssetUtil.submitAssetTx = function (userid, assetname, size, tx, side, txs) {
  sails.log.info('[TradeAssetUtil.submitAssetTx] start: userid ' + userid + ' assetname: ' + assetname + ' size: ' + size + ' tx: ' + tx + ' side: ' + side + ' txs:' + JSON.stringify(txs));
  const assetTx = {};
  assetTx.userid = userid;
  assetTx.asset = assetname;
  assetTx.side = side;
  assetTx.amount = size;
  assetTx.status = sails.config.asset.tx_submitted;
  assetTx.tx = tx;
  assetTx.txs = txs;
  return TradeAssetUtil.createAssetTx(assetTx);
}
TradeAssetUtil.updateAssetTxInRedis = function (userid, tx, assetTx) {
  sails.log.info('[TradeAssetUtil.updateAssetTxInRedis] start: userid ' + userid + ' assetTx: ' + JSON.stringify(assetTx));
  return new Promise((resolve, reject) => {
    if (userid == null || userid == undefined || userid == 'undefined' || userid == 'null') {
      return reject({ err: 'userid_null' });
    }
    if (assetTx == null || assetTx == undefined || assetTx == 'undefined' || assetTx == 'null') {
      return reject({ err: 'assetTx_null' });
    }
    if (tx == null || tx == undefined || tx == 'undefined' || tx == 'null') {
      return reject({ err: 'tx_null' });
    }
    RedisUtil.hset(sails.config.redis.asset_tx_redis_hashkey + '_' + userid, tx, JSON.stringify(assetTx))
      .then((flag) => {
        resolve(flag);
      });
  });
}
TradeAssetUtil.getAssetTxsInRedis = function (userid) {
  sails.log.info('[TradeAssetUtil.getAssetTxsInRedis] start: userid ' + userid);
  return new Promise((resolve, reject) => {
    if (userid == null || userid == undefined || userid == 'undefined' || userid == 'null') {
      return reject({ err: 'userid_null' });
    }
    RedisUtil.hkeys(sails.config.redis.asset_tx_redis_hashkey + '_' + userid)
      .then((replies) => {
        resolve(replies);
      });
  });
}
TradeAssetUtil.getAssetTxInRedis = function (userid, txid) {
  sails.log.info('[TradeAssetUtil.getAssetTxInRedis] start: userid ' + userid);
  return new Promise((resolve, reject) => {
    if (userid == null || userid == undefined || userid == 'undefined' || userid == 'null') {
      return reject({ err: 'userid_null' });
    }
    if (txid == null || txid == undefined || txid == 'undefined' || txid == 'null') {
      return reject({ err: 'txid_null' });
    }
    RedisUtil.hget(sails.config.redis.asset_tx_redis_hashkey + '_' + userid, txid).then((asset) => {
      resolve(asset);
    });
  });
}
TradeAssetUtil.addChangedInfoToMq = function (
  userid,
  asset,
  assetHistoryIn,
  assetHistoryOut,
  order,
  cancelOrder,
  finishedOrder,
  receiveObject,
  assetTx
) {
  sails.log.info('[TradeAssetUtil.addChangedInfoToMq] start: userid ' + userid + ' asset: ' + JSON.stringify(asset) + ' assetHistoryIn: ' + JSON.stringify(assetHistoryIn) + ' assetHistoryOut:' + JSON.stringify(assetHistoryOut) + ' order:' + JSON.stringify(order) + ' cancelOrder:' + JSON.stringify(cancelOrder) + ' finishedOrder:' + JSON.stringify(finishedOrder));
  const changeInfo = {};
  if (userid) {
    changeInfo.userid = userid;
  }
  if (assetHistoryIn) {
    changeInfo.assetHistoryIn = assetHistoryIn;
  }
  if (assetHistoryOut) {
    changeInfo.assetHistoryOut = assetHistoryOut;
  }
  if (asset) {
    changeInfo.asset = asset;
  }
  if (order) {
    changeInfo.order = order;
  }
  if (cancelOrder) {
    changeInfo.cancelOrder = cancelOrder;
  }
  if (finishedOrder) {
    changeInfo.finishedOrder = finishedOrder;
  }
  if (receiveObject) {
    changeInfo.receiveObject = JSON.parse(JSON.stringify(receiveObject));
    delete changeInfo.receiveObject.account;
  }
  if (assetTx) {
    changeInfo.assetTx = assetTx;
  }

  return MQUtil.sendMessage(sails.config.mq.change_mq_info, JSON.stringify(changeInfo));
}
TradeAssetUtil.addMatchResToMq = function (order) {
  sails.log.info('[TradeAssetUtil.addMatchResToMq] start: order ' + order);
  return MQUtil.sendMessage(sails.config.mq.order_mq_match, JSON.stringify(order));
}
TradeAssetUtil.getMatchResFromMq = function (vt) {
  let resp;
  try {
    resp = MQUtil.receiveMessage(sails.config.mq.order_mq_match, vt);
  } catch (exception) {
    sails.log.error("MQUtil.receiveMessage " + sails.config.mq.order_mq_match);
    sails.log.error(exception);
  }
  return resp;
}
TradeAssetUtil.removeMatchResFromMq = function (id) {
  return MQUtil.deleteMessage(sails.config.mq.order_mq_match, id);
}
TradeAssetUtil.updateCancelAsset = function (userid, asset, assetFrozen, assetAvailable) {
  sails.log.info('[TradeAssetUtil.updateCancelAsset] start: userid ' + userid + ' asset: ' + asset + ' assetFrozen: ' + assetFrozen + ' assetAvailable:' + assetAvailable);
  return new Promise((resolve, reject) => {
    DBUtil.findTradeAsset(String(userid)).then((record) => {
      if (record == undefined || record == 'undefined' || record == null || record == 'null') {
        reject({ error: "system_error_userid_notfound" });
      } else {
        if (asset && asset[assetFrozen]) {
          record[assetAvailable] = CommonUtil.add(record[assetAvailable], asset[assetFrozen]);
          record[assetFrozen] = CommonUtil.subtract(record[assetFrozen], asset[assetFrozen]);
          if (parseFloat(record[assetFrozen]) < 0) {
            return reject(`[TradeAssetUtil.updateCancelAsset] balance not enough`);
          } else {
            DBUtil.updateTradeAsset(userid, record)
              .then((result) => {
                return resolve(result[0]);
              }).catch((err) => {
                sails.log.error("err", err);
              });
          }
        }
      }
    })
  });
}
TradeAssetUtil.createAssetTx = function (assetTx) {
  sails.log.info('[TradeAssetUtil.createAssetTx] start: assetTx ' + assetTx);
  return new Promise((resolve, reject) => {
    DBUtil.createAssetTx(assetTx).then((result) => {
      resolve(result);
    }).catch((err) => {
      sails.log.error("err", err);
      reject(err);
    });
  })
}
TradeAssetUtil.updateAssetTx = function (tx, status) {
  sails.log.info('[TradeAssetUtil.updateAssetTx] start: tx ' + tx + ' status:' + status);
  return new Promise((resolve, reject) => {
    try {
      DBUtil.updateAssetTx({ tx: tx }, { status: status }).then((result) => {
        resolve(result);
      }).catch((err) => {
        sails.log.error("err", err);
        reject(err);
      });
    } catch (error) {
      sails.log.error(error);
    }
  })
}
TradeAssetUtil.createOrder = function (order) {
  sails.log.info('[TradeAssetUtil.createOrder] start: order ' + order);
  return new Promise((resolve, reject) => {
    var orderObj = {};
    orderObj.orderid = order.id;
    orderObj.takerfee = order.taker_fee;
    orderObj.makerfee = order.maker_fee;
    orderObj.dealstock = order.deal_stock;
    orderObj.dealmoney = order.deal_money;
    orderObj.dealfee = order.deal_fee;
    orderObj.ctime = order.ctime;
    orderObj.user = order.user;
    orderObj.market = order.market;
    orderObj.source = order.source;
    orderObj.type = order.type;
    orderObj.side = order.side;
    orderObj.price = order.price;
    orderObj.amount = order.amount;
    orderObj.left = order.left;
    try {
      DBUtil.createOrder(orderObj).then((result) => {
        resolve(result);
      }).catch((err) => {
        sails.log.error("err", err);
        reject(err);
      });
    } catch (error) {
      sails.log.error(error);
    }
  });
}
TradeAssetUtil.updateOrderFinish = function (orderid, order) {
  sails.log.info('[TradeAssetUtil.updateOrderFinish] start: orderid ' + orderid + ' order:' + order);
  let order2Update = {};
  if (order.left != undefined && order.left != 'undefined' && order.left != null && order.left != 'null') {
    order2Update.left = order.left;
    if (order.left == '0e-8') {
      order2Update.state = sails.config.order.order_state_finished;
    }
  } else {
    order2Update.left = '0e-8';
    order2Update.state = sails.config.order.order_state_finished;
  }
  if (order.deal_stock != undefined && order.deal_stock != 'undefined' && order.deal_stock != null && order.deal_stock != 'null') {
    order2Update.dealstock = order.deal_stock;
  }
  if (order.deal_money != undefined && order.deal_money != 'undefined' && order.deal_money != null && order.deal_money != 'null') {
    order2Update.dealmoney = order.deal_money;
  }
  if (order.deal_fee != undefined && order.deal_fee != 'undefined' && order.deal_fee != null && order.deal_fee != 'null') {
    order2Update.dealfee = order.deal_fee;
  }
  return DBUtil.updateOrder(orderid, order2Update);
}
TradeAssetUtil.updateOrderCancel = function (orderid) {
  sails.log.info('[TradeAssetUtil.updateOrderCancel] start: orderid ' + orderid);
  var orderCancel = {};
  orderCancel.state = sails.config.order.order_state_cancel;
  orderCancel.left = '0e-8';
  return DBUtil.updateOrder(orderid, orderCancel);
}
TradeAssetUtil.updateOrderInRedis = function (userid, orderid, order) {
  sails.log.info('[TradeAssetUtil.updateOrderInRedis] start: userid ' + userid + ' orderid:' + orderid + ' order:' + order);
  return new Promise((resolve, reject) => {
    if (!userid) {
      return reject({ err: 'userid_null' });
    }
    if (!orderid) {
      return reject({ err: 'orderid_null' });
    }
    if (!order) {
      return reject({ err: 'order_null' });
    }
    RedisUtil.hset(sails.config.redis.order_redis_hashkey + '_' + userid, orderid, JSON.stringify(order))
      .then((flag) => {
        resolve(flag);
      });
  });
}
TradeAssetUtil.getOrderInRedis = (userid) => {
  sails.log.info('[TradeAssetUtil.getOrderInRedis] start: userid ' + userid);
  return new Promise((resolve, reject) => {
    if (!userid) {
      return reject({ err: 'userid_null' });
    }
    RedisUtil.hvals(sails.config.redis.order_redis_hashkey + '_' + userid)
      .then((replies) => {
        resolve(replies);
      });
  });
}

TradeAssetUtil.findOrder = (userid) => DBUtil.findOrder({ user: userid });

TradeAssetUtil.findPendingOrder = (userid) => DBUtil.findOrder({ user: userid, state: '1' });

TradeAssetUtil.getHistoryOrder = (userid) => DBUtil.findOrder({ user: userid, or: [{ state: '3' }, { state: '2' }] });

TradeAssetUtil.findFinishedOrder = (userid) => DBUtil.findOrder({ user: userid, or: [{ state: '3' }, { state: '2', dealmoney: { '!': '0' } }] });

TradeAssetUtil.findUserOrder = (userid, start, end) => DBUtil.findOrder({ user: userid, sort: 'updatedAt DESC', ctime: { '>=': start, '<=': end } });

TradeAssetUtil.getTradeAssetHistory = (conditon) => {
  sails.log.info('[TradeAssetUtil.getTradeAssetHistory] start: conditon ' + conditon);
  return DBUtil.getTradeAssetHistory(conditon);
}

TradeAssetUtil.getTradeAssetHistoryInRedis = (userid) => {
  sails.log.info('[TradeAssetUtil.getTradeAssetHistoryInRedis] start: userid ' + userid);
  return new Promise((resolve, reject) => {
    if (!userid) {
      return reject({ err: 'userid_null' });
    }
    RedisUtil.hkeys(sails.config.redis.trade_asset_history_redis_hashkey + '_' + userid)
      .then((replies) => {
        resolve(replies);
      });
  });
}
TradeAssetUtil.getTradeAssetInRedis = function (userid) {
  sails.log.info('[TradeAssetUtil.getTradeAssetInRedis] start: userid ' + userid);
  return new Promise((resolve, reject) => {
    if (userid == null || userid == undefined || userid == 'undefined' || userid == 'null') {
      return reject({ err: 'userid_null' });
    }
    RedisUtil.hget(sails.config.redis.trade_asset_redis_hashkey, userid)
      .then((asset) => {
        resolve(asset);
      });
  });
}
TradeAssetUtil.updateTradeAssetInRedis = function (userid, asset) {
  sails.log.info('[TradeAssetUtil.updateTradeAssetInRedis] start: userid ' + userid + ' asset: ' + JSON.stringify(asset));
  return new Promise((resolve, reject) => {
    if (userid == null || userid == undefined || userid == 'undefined' || userid == 'null') {
      return reject({ err: 'userid_null' });
    }
    if (asset == null || asset == undefined || asset == 'undefined' || asset == 'null') {
      return reject({ err: 'asset_null' });
    }
    RedisUtil.hset(sails.config.redis.trade_asset_redis_hashkey, userid, JSON.stringify(asset))
      .then((flag) => {
        resolve(flag);
      });
  });
}

TradeAssetUtil.updateTradeAssetHistoryInRedis = function (userid, assetHistory, side) {
  sails.log.info('[TradeAssetUtil.updateTradeAssetHistoryInRedis] start: userid ' + userid + ' assetHistory: ' + JSON.stringify(assetHistory) + ' side: ' + side);
  return new Promise((resolve, reject) => {
    if (userid == null || userid == undefined || userid == 'undefined' || userid == 'null') {
      reject({ err: 'userid_null' });
      return;
    }
    if (assetHistory == null || assetHistory == undefined || assetHistory == 'undefined' || assetHistory == 'null') {
      reject({ err: 'assetHistory_null' });
      return;
    }
    if (side == null || side == undefined || side == 'undefined' || side == 'null') {
      reject({ err: 'side_null' });
      return;
    }
    var state;
    if (side == sails.config.asset.trade_assets_history_side_deposit) {
      state = sails.config.asset.trade_assets_history_state_deposited;
    } else if (side == sails.config.asset.trade_assets_history_side_withdraw) {
      state = sails.config.asset.trade_assets_history_state_withdraw;
    } else if (side == sails.config.asset.trade_assets_history_side_sell) {
      state = sails.config.asset.trade_assets_history_state_sell;
    } else if (side == sails.config.asset.trade_assets_history_side_buy) {
      state = sails.config.asset.trade_assets_history_state_buy;
    }

    RedisUtil.hset(sails.config.redis.trade_asset_history_redis_hashkey + '_' + userid, JSON.stringify(assetHistory), state)
      .then((flag) => {
        resolve(flag);
      });
  });
}

TradeAssetUtil.updateTradeAssetFinishedOrder = function (userid, asset, assetAvailableName, assetFrozenName) {
  sails.log.info('[TradeAssetUtil.updateTradeAssetFinishedOrder] start: userid ' + userid + ' asset: ' + asset + ' assetFrozenName: ' + assetFrozenName + ' assetAvailableName:' + assetAvailableName);
  return new Promise((resolve, reject) => {
    DBUtil.findTradeAsset(String(userid)).then((record) => {
      if (record == undefined || record == 'undefined' || record == null || record == 'null') {
        reject({ error: "system_error_userid_notfound" });
      } else {
        if (asset && asset[assetAvailableName]) {
          record[assetAvailableName] = CommonUtil.add(record[assetAvailableName], asset[assetAvailableName]);
        }
        if (asset && asset[assetFrozenName]) {
          record[assetFrozenName] = CommonUtil.subtract(record[assetFrozenName], asset[assetFrozenName]);
          if (parseFloat(record[assetFrozenName]) < 0) {
            console.log('[here4]')
            return reject({error:`balance not enough`});
          } else {
            DBUtil.updateTradeAsset(String(userid), record).then((result) => {
              return resolve(result[0]);
            }).catch((err) => {
              sails.log.error("err", err);
            });

          }
        }
      }
    });
  });
};

TradeAssetUtil.updateTradeAssetPutLimit = function (userid, asset, assetFrozenName, assetAvailableName) {
  sails.log.info('[TradeAssetUtil.updateTradeAssetPutLimit] start: userid ' + userid + ' asset: ' + JSON.stringify(asset) + ' assetFrozenName: ' + assetFrozenName + ' assetAvailableName:' + assetAvailableName);
  return new Promise((resolve, reject) => {
    DBUtil.findTradeAsset(String(userid)).then((record) => {
      if (record == undefined || record == 'undefined' || record == null || record == 'null') {
        return reject({ error: "system_error_userid_notfound" });
      } else {
        if (asset && asset[assetFrozenName]) {
          record[assetFrozenName] = CommonUtil.add(record[assetFrozenName], asset[assetFrozenName]);
          record[assetAvailableName] = CommonUtil.subtract(record[assetAvailableName], asset[assetFrozenName]);
          if (parseFloat(record[assetAvailableName]) < 0) {
            console.log('[here5]')
            return reject({error:`balance not enough`});
          } else {
            DBUtil.updateTradeAsset(userid, record).then((result) => {
              return resolve(result[0]);
            }).catch((err) => {
              sails.log.error("err", err);
            });
          }
        }
      }
    })
  });
};

TradeAssetUtil.updateTradeAssetBalance = function (userid, asset, side, assetAvailableName) {
  sails.log.info('[TradeAssetUtil.updateTradeAssetBalance] start: userid ' + userid + ' asset: ' + asset + ' side: ' + side + ' assetAvailableName:' + assetAvailableName);
  return new Promise((resolve, reject) => {
    DBUtil.findTradeAsset(userid).then((record) => {
      if (record == undefined || record == 'undefined') {
        DBUtil.createTradeAsset(asset).then((result) => {
          return resolve(result);
        });
      } else if (side == sails.config.asset.assets_side_withdraw) {
        if (asset && asset[assetAvailableName]) {
          record[assetAvailableName] = CommonUtil.subtract(record[assetAvailableName], asset[assetAvailableName]);
          if (parseFloat(record[assetAvailableName]) < 0) {
            console.log('[here6]')
            return reject({ error: `balance not enough` });
          } else {
            DBUtil.updateTradeAsset(userid, record).then((result) => {
              return resolve(result[0]);
            }).catch((err) => {
              sails.log.error("err", err);
            });
          }
        }
      } else if (side == sails.config.asset.assets_side_deposit) {
        if (asset && asset[assetAvailableName]) {
          record[assetAvailableName] = CommonUtil.add(record[assetAvailableName], asset[assetAvailableName]);
          DBUtil.updateTradeAsset(userid, record)
            .then((result) => {
              return resolve(result[0]);
            }).catch((err) => {
              sails.log.error("err", err);
            });
        }
      }
    })
  })
};

TradeAssetUtil.createTradeAssetHistoryBalance = function (userid, asset, amount, detail, side) {
  sails.log.info('[TradeAssetUtil.createTradeAssetHistoryBalance] start : userid ' + userid + ' asset: ' + asset + ' amount: ' + amount + ' detail: ' + JSON.stringify(detail) + ' side: ' + side);
  if (userid == null || userid == undefined || userid == 'undefined' || userid == 'null') {
    return { err: 'userid_null' };
  }
  if (asset == null || asset == undefined || asset == 'undefined' || asset == 'null') {
    return { err: 'asset_null' };
  }
  if (amount == null || amount == undefined || amount == 'undefined' || amount == 'null') {
    return { err: 'amount_null' };
  }
  const assetHistoryRecord = {};
  assetHistoryRecord.userid = userid;
  assetHistoryRecord.asset = asset;
  assetHistoryRecord.amount = parseFloat(amount);
  assetHistoryRecord.timestamp = new Date().getTime();
  assetHistoryRecord.side = side;
  assetHistoryRecord.fee = '0';
  if (side == sails.config.asset.trade_assets_history_side_deposit) {
    assetHistoryRecord.state = sails.config.asset.trade_assets_history_state_deposited;
  } else if (side == sails.config.asset.trade_assets_history_side_withdraw) {
    assetHistoryRecord.state = sails.config.asset.trade_assets_history_state_withdraw;
  }
  if (detail) {
    assetHistoryRecord.detail = detail;
  }
  let promise;
  try {
    promise = DBUtil.createTradeAssetHistory(assetHistoryRecord);
  } catch (exception) {
    sails.log.error('DBUtil.createTradeAssetHistory', assetHistoryRecord);
  }
  return promise;
};

TradeAssetUtil.createTradeAssetHistory = function (assetHistoryRecord) {
  let promise;
  try {
    promise = DBUtil.createTradeAssetHistory(assetHistoryRecord);
  } catch (exception) {
    sails.log.error('DBUtil.createTradeAssetHistory', assetHistoryRecord);
  }
  return promise;
}
module.exports = TradeAssetUtil;


