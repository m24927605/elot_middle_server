var UserUtil = function () { }
UserUtil.userid = parseInt(String(new Date().getTime()).substring(0, 9));
UserUtil.generateUserID = function () {
	UserUtil.userid = UserUtil.userid + 1;
	return UserUtil.userid;
}
UserUtil.processInnerAccount = function (wallet) {
	try {
		delete wallet.mnemonic;
		delete wallet.bip39Seed;
		delete wallet.bip32BTCRootKey;
		delete wallet.bip32USDTRootKey;
		delete wallet.bip32LTCRootKey;
		delete wallet.bip32ETHRootKey;
		// delete wallet.bip32BCHRootKey
		delete wallet.ETHAccount.privateKey;
		delete wallet.ELOTAccount.privateKey;
		delete wallet.EOSAccount.privateKey;
		delete wallet.ETCAccount.privateKey;
		delete wallet.BTCAccount.privateKey;
		delete wallet.LTCAccount.privateKey;
		// delete wallet.BCHAccount.privateKey;
		delete wallet.USDTAccount.privateKey;
	} catch (exception) {
		sails.log.error('[UserUtil.processInnerAccount] : ', exception);
	}
}
module.exports = UserUtil;