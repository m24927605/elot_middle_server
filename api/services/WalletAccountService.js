


var walletUtil = require('../utils/HDwalletUtil');

module.exports = {
    impoartAccountByMnemonic: function (mnemonic) {
        var accounts = {};
        accounts.mnemonic = mnemonic;

        var seedHex = walletUtil.getBip39SeedHex(mnemonic);
        accounts.bip39Seed = seedHex;

        var bip32BTCRootKey = walletUtil.getBip32BTCRootKey(mnemonic);
        accounts.bip32BTCRootKey = bip32BTCRootKey;


        var bip32USDTRootKey = walletUtil.getBip32USDTRootKey(mnemonic);
        accounts.bip32USDTRootKey = bip32BTCRootKey;

        // var bip32BCHRootKey =walletUtil.getBip32BCHRootKey(mnemonic);
        // accounts.bip32BCHRootKey = bip32BCHRootKey;

        var bip32LTCRootKey = walletUtil.getBip32LTCRootKey(mnemonic);
        accounts.bip32LTCRootKey = bip32LTCRootKey;

        var bip32ETHRootKey = walletUtil.getBip32ETHRootKey(mnemonic);
        accounts.bip32ETHRootKey = bip32ETHRootKey;

        var ETHAccount = walletUtil.getETHAccount(bip32ETHRootKey.root);
        accounts.ETHAccount = ETHAccount;

        var ELOTAccount = walletUtil.getELOTAccount(bip32ETHRootKey.root);
        accounts.ELOTAccount = ELOTAccount;

        var EOSAccount = walletUtil.getEOSAccount(bip32ETHRootKey.root);
        accounts.EOSAccount = EOSAccount;

        var ETCAccount = walletUtil.getETCAccount(bip32ETHRootKey.root);
        accounts.ETCAccount = ETCAccount;

        var BTCAccount = walletUtil.getBTCAccount(bip32BTCRootKey.root);
        accounts.BTCAccount = BTCAccount;

        var LTCAccount = walletUtil.getLTCAccount(bip32LTCRootKey.root);
        accounts.LTCAccount = LTCAccount;

        // var BCHAccount = walletUtil.getBCHAccount(bip32BCHRootKey.root);
        // accounts.BCHAccount = BCHAccount;

        var USDTAccount = walletUtil.getUSDTAccount(bip32USDTRootKey.root);
        accounts.USDTAccount = USDTAccount;

        return accounts;
    },


    generateAccount: function () {


        var accounts = {};
        var mnemonic = walletUtil.generateMnemonic();
        accounts.mnemonic = mnemonic;

        var seedHex = walletUtil.getBip39SeedHex(mnemonic);
        accounts.bip39Seed = seedHex;

        var bip32BTCRootKey = walletUtil.getBip32BTCRootKey(mnemonic);
        accounts.bip32BTCRootKey = bip32BTCRootKey;

        var bip32USDTRootKey = walletUtil.getBip32USDTRootKey(mnemonic);
        accounts.bip32USDTRootKey = bip32USDTRootKey;

        // var bip32BCHRootKey =walletUtil.getBip32BCHRootKey(mnemonic);
        // accounts.bip32BCHRootKey = bip32BCHRootKey;

        var bip32LTCRootKey = walletUtil.getBip32LTCRootKey(mnemonic);
        accounts.bip32LTCRootKey = bip32LTCRootKey;

        var bip32ETHRootKey = walletUtil.getBip32ETHRootKey(mnemonic);
        accounts.bip32ETHRootKey = bip32ETHRootKey;

        var ETHAccount = walletUtil.getETHAccount(bip32ETHRootKey.root);
        accounts.ETHAccount = ETHAccount;

        var ELOTAccount = walletUtil.getELOTAccount(bip32ETHRootKey.root);
        accounts.ELOTAccount = ELOTAccount;

        var EOSAccount = walletUtil.getEOSAccount(bip32ETHRootKey.root);
        accounts.EOSAccount = EOSAccount;

        var ETCAccount = walletUtil.getETCAccount(bip32ETHRootKey.root);
        accounts.ETCAccount = ETCAccount;

        var BTCAccount = walletUtil.getBTCAccount(bip32BTCRootKey.root);
        accounts.BTCAccount = BTCAccount;

        var LTCAccount = walletUtil.getLTCAccount(bip32LTCRootKey.root);
        accounts.LTCAccount = LTCAccount;

        // var BCHAccount = walletUtil.getBCHAccount(bip32BCHRootKey.root);
        // accounts.BCHAccount = BCHAccount;

        var USDTAccount = walletUtil.getUSDTAccount(bip32USDTRootKey.root);
        accounts.USDTAccount = USDTAccount;

        return accounts;
    },

    impoartAccountBySeedHex: function (seedHex) {


        var accounts = {};

        var bip32BTCRootKeyBySeedHex = walletUtil.getBip32BTCRootKeyBySeedHex(seedHex);
        accounts.bip32BTCRootKey = bip32BTCRootKeyBySeedHex;

        var bip32USDTRootKeyBySeedHex = walletUtil.getBip32USDTRootKeyBySeedHex(seedHex);
        accounts.bip32USDTRootKey = bip32USDTRootKeyBySeedHex;

        //  var bip32BCHRootKeyBySeedHex = walletUtil.getBip32BCHRootKeyBySeedHex(seedHex);
        // accounts.bip32BCHRootKey = bip32BCHRootKeyBySeedHex;

        var bip32LTCRootKeyBySeedHex = walletUtil.getBip32LTCRootKeyBySeedHex(seedHex);
        accounts.bip32LTCRootKey = bip32LTCRootKeyBySeedHex;

        var bip32ETHRootKeyByHex = walletUtil.getBip32ETHRootKeyByHex(seedHex);
        accounts.bip32ETHRootKey = bip32ETHRootKeyByHex;


        var ETHAccount = walletUtil.getETHAccount(bip32ETHRootKeyByHex.root);
        accounts.ETHAccount = ETHAccount;

        var ELOTAccount = walletUtil.getELOTAccount(bip32ETHRootKeyByHex.root);
        accounts.ELOTAccount = ELOTAccount;

        var EOSAccount = walletUtil.getEOSAccount(bip32ETHRootKeyByHex.root);
        accounts.EOSAccount = EOSAccount;

        var ETCAccount = walletUtil.getETCAccount(bip32ETHRootKeyByHex.root);
        accounts.ETCAccount = ETCAccount;

        var BTCAccount = walletUtil.getBTCAccount(bip32BTCRootKeyBySeedHex.root);
        accounts.BTCAccount = BTCAccount;

        var LTCAccount = walletUtil.getLTCAccount(bip32LTCRootKeyBySeedHex.root);
        accounts.LTCAccount = LTCAccount;

        // var BCHAccount = walletUtil.getBCHAccount(bip32BCHRootKeyBySeedHex.root);
        // accounts.BCHAccount = BCHAccount;

        var USDTAccount = walletUtil.getUSDTAccount(bip32USDTRootKeyBySeedHex.root);
        accounts.USDTAccount = USDTAccount;

        return accounts;
    }
}