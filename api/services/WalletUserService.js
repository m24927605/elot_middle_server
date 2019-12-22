const UserUtil = require('../utils/UserUtil');
const DBUtil = require('../utils/DBUtil');
const TradeAssetUtil = require('../utils/TradeAssetUtil');
module.exports = {
  getUserById: function (userid) {
    return new Promise(function (resolve, reject) {
      Users.findOne({ userid }).exec(function (err, user) {
        if (err) {
          reject(err);
        }
        if (user) {
          UserUtil.processInnerAccount(user.wallet);
          resolve(user);
        } else {
          resolve(null);
        }
      });
    });
  },
  getAccountByUserid: function (userid) {
    return new Promise(function (resolve, reject) {
      Users.findOne({ userid: userid }).exec(function (err, user) {
        if (err) {
          reject(err);
        }
        if (user) {
          resolve(user.wallet);
        }
      });
    });
  },
  getAccountByEmail: function (email) {
    return new Promise(function (resolve, reject) {
      Users.findOne({ email: email }).exec(function (err, user) {
        if (err) {
          reject(err);
        }
        if (user) {
          UserUtil.processInnerAccount(user.wallet);
          resolve(user);
        } else {
          resolve(null);
        }
      });
    });
  },
  register: function (userobj) {
    return new Promise(async (resolve, reject) => {
      userobj.userid = UserUtil.generateUserID();
      userobj.wallet = WalletAccountService.generateAccount();
      userobj.timestamp = new Date().getTime();

      const asset = await DBUtil.createTradeAsset({ userid: userobj.userid });
      await TradeAssetUtil.updateTradeAssetInRedis(userobj.userid, asset);

      Users.findOrCreate({ email: userobj.email }, userobj).exec(function (err, user) {
        if (err) {
          reject(err);
        }
        if (user) {
          UserUtil.processInnerAccount(user.wallet);
          resolve(user);
        } else {
          resolve(null);
        }
      });
    });
  }
}