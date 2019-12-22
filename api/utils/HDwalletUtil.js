/**
* 助记词和各种币种：BTC BCH ETC ETH LTC的账号生成工具包
*/

let bip39 = require("bip39");
let hdkey = require('ethereumjs-wallet/hdkey');
let bitcoin = require('bitcoinjs-lib');
var walletUtil = function () { }

walletUtil.generateMnemonic = function () {
  var Mnemonic = require('bitcore-mnemonic');
  var code = new Mnemonic();
  return code.toString();
}

walletUtil.getBip32ETHRootKey = function (MnemonicWords) {
  var hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(MnemonicWords));
  return { root: hdwallet, xprv: hdwallet.privateExtendedKey(), xpub: hdwallet.publicExtendedKey() };
}

walletUtil.getBip32ETHRootKeyByHex = function (seedHex) {
  var root = bitcoin.bip32.fromSeed(Buffer.from(seedHex, "hex"));
  var hdwallet = hdkey.fromExtendedKey(root.toBase58());
  return { root: hdwallet, xprv: hdwallet.privateExtendedKey(), xpub: hdwallet.publicExtendedKey() };
}

walletUtil.getBip39SeedHex = function (MnemonicWords, password) {
  let seedHex;
  if (password) {
    seedHex = bip39.mnemonicToSeedHex(MnemonicWords, password);
  } else {
    seedHex = bip39.mnemonicToSeedHex(MnemonicWords);
  }
  return seedHex;
}

walletUtil.getBip32BTCRootKeyBySeedHex = function (seedHex) {
  var root = bitcoin.bip32.fromSeed(Buffer.from(seedHex, "hex"));
  return { root: root, xprv: root.toBase58(), xpub: root.neutered().toBase58() };
}

walletUtil.getBip32USDTRootKey = function (MnemonicWords) {
  var root = bitcoin.bip32.fromSeed(bip39.mnemonicToSeed(MnemonicWords));
  return { root: root, xprv: root.toBase58(), xpub: root.neutered().toBase58() };
}

walletUtil.getBip32USDTRootKeyBySeedHex = function (seedHex) {
  var root = bitcoin.bip32.fromSeed(Buffer.from(seedHex, "hex"));
  return { root: root, xprv: root.toBase58(), xpub: root.neutered().toBase58() };
}

walletUtil.getBip32BCHRootKey = function (MnemonicWords) {
  var root = bitcoin.bip32.fromSeed(bip39.mnemonicToSeed(MnemonicWords));
  return { root: root, xprv: root.toBase58(), xpub: root.neutered().toBase58() };
}

walletUtil.getBip32BCHRootKeyBySeedHex = function (seedHex) {
  var root = bitcoin.bip32.fromSeed(Buffer.from(seedHex, "hex"));
  return { root: root, xprv: root.toBase58(), xpub: root.neutered().toBase58() };
}

walletUtil.getBip32BTCRootKey = function (MnemonicWords) {
  var root = bitcoin.bip32.fromSeed(bip39.mnemonicToSeed(MnemonicWords));
  return { root: root, xprv: root.toBase58(), xpub: root.neutered().toBase58() };
}

walletUtil.getBip32BTCRootKeyBySeedHex = function (seedHex) {
  if (sails.config.globals.btc_current_net == 0) {
    var root = bitcoin.bip32.fromSeed(Buffer.from(seedHex, "hex"));
    root.network = bitcoin.networks.testnet;
    return { root: root, xprv: root.toBase58(), xpub: root.neutered().toBase58() };
  } else if (sails.config.globals.btc_current_net == 1) {
    var root = bitcoin.bip32.fromSeed(Buffer.from(seedHex, "hex"));
    return { root: root, xprv: root.toBase58(), xpub: root.neutered().toBase58() };
  }
}

walletUtil.getBip32BTCRootKey = function (MnemonicWords) {
  if (sails.config.globals.btc_current_net == 0) {
    var root = bitcoin.bip32.fromSeed(bip39.mnemonicToSeed(MnemonicWords));
    root.network = bitcoin.networks.testnet;
    return { root: root, xprv: root.toBase58(), xpub: root.neutered().toBase58() };
  } else if (sails.config.globals.btc_current_net == 1) {
    var root = bitcoin.bip32.fromSeed(bip39.mnemonicToSeed(MnemonicWords));
    return { root: root, xprv: root.toBase58(), xpub: root.neutered().toBase58() };
  }
}

//  walletUtil.getBip32BTCTestnetRootKeyBySeedHex = function(seedHex){

//    var root = bitcoin.bip32.fromSeed(Buffer.from(seedHex, "hex"));
//    root.network = bitcoin.networks.testnet;
//    return {root:root, xprv:root.toBase58(),xpub:root.neutered().toBase58()};
// }

//  walletUtil.getBip32BTCTestnetRootKey = function(MnemonicWords){
//    var root = bitcoin.bip32.fromSeed(bip39.mnemonicToSeed(MnemonicWords));
//    root.network = bitcoin.networks.testnet;
//    return {root:root, xprv:root.toBase58(),xpub:root.neutered().toBase58()};
// }

walletUtil.getBip32LTCRootKeyBySeedHex = function (seedHex) {
  var root = bitcoin.bip32.fromSeed(Buffer.from(seedHex, "hex"));
  root.network = sails.config.bip.ltc_network;
  return { root: root, xprv: root.toBase58(), xpub: root.neutered().toBase58() };
}

walletUtil.getBip32LTCRootKey = function (MnemonicWords) {
  var root = bitcoin.bip32.fromSeed(bip39.mnemonicToSeed(MnemonicWords));
  root.network = sails.config.bip.ltc_network;
  return { root: root, xprv: root.toBase58(), xpub: root.neutered().toBase58() };
}

walletUtil.getBCHAccount = function (root, derivePath) {

  //  var child;
  //  if(!derivePath)
  //  {
  //     //child =root.derivePath("m/44'/145'/0'/0/0");
  //     child =root.derivePath(sails.config.bip.bch_derive_path);


  //  }else
  //  {
  //     child =root.derivePath(derivePath); 
  //  }


  // const Address        = bch.Address;
  // const BitpayFormat   = Address.BitpayFormat;
  // const CashAddrFormat = Address.CashAddrFormat;
  // const address = new bch.PrivateKey(child.toWIF()).toAddress();


  // return { 
  //           coin : "BCH", 
  //           privateKey   : child.toWIF(),
  //           publicKey    : child.publicKey.toString("hex"),
  //           address      : address.toString(),
  //           cashaddress  : address.toString(CashAddrFormat),
  //           bitpayaddress: address.toString(BitpayFormat)

  //         };

}

walletUtil.getUSDTAccount = function (root, derivePath) {
  var child;
  if (!derivePath) {
    child = root.derivePath(sails.config.bip.usdt_derive_path);
  } else {
    child = root.derivePath(derivePath);
  }
  const keyPair = bitcoin.ECPair.fromWIF(child.toWIF());
  return { coin: "USDT", privateKey: child.toWIF(), publicKey: child.publicKey.toString("hex"), address: bitcoin.payments.p2pkh({ pubkey: child.publicKey }).address };
}

walletUtil.getBTCAccount = function (root, derivePath) {
  if (sails.config.globals.btc_current_net == 0) {
    return walletUtil.getBTCTestnetAccount(root, derivePath);
  } else if (sails.config.globals.btc_current_net == 1) {
    return walletUtil.getBTCMainnetAccount(root, derivePath);
  }
}

walletUtil.getBTCMainnetAccount = function (root, derivePath) {
  var child;
  if (!derivePath) {
    child = root.derivePath(sails.config.bip.btc_derive_path);
  } else {
    child = root.derivePath(derivePath);
  }
  const keyPair = bitcoin.ECPair.fromWIF(child.toWIF());
  return { coin: "BTC", privateKey: child.toWIF(), publicKey: child.publicKey.toString("hex"), address: bitcoin.payments.p2pkh({ pubkey: child.publicKey }).address };
}

walletUtil.getBTCTestnetAccount = function (root, derivePath) {
  var child;
  if (!derivePath) {
    child = root.derivePath(sails.config.bip.btctestnet_derive_path);
  } else {
    child = root.derivePath(derivePath);
  }
  return { coin: "BTC", privateKey: child.toWIF(), publicKey: child.publicKey.toString("hex"), address: bitcoin.payments.p2pkh({ pubkey: child.publicKey, network: bitcoin.networks.testnet }).address };
}


walletUtil.getELOTAccount = function (root, derivePath) {
  var wallet_hdpath;
  if (!derivePath) {
    wallet_hdpath = sails.config.bip.elot_derive_path;
  } else {
    wallet_hdpath = derivePath;
  }
  var wallet = root.derivePath(wallet_hdpath).getWallet();
  var address = '0x' + wallet.getAddress().toString("hex");
  var privateKey = wallet.getPrivateKey().toString("hex");
  var publicKey = wallet.getPublicKey().toString("hex");
  return { coin: "ELOT", privateKey: privateKey, publicKey: publicKey, address: address };
}

walletUtil.getEOSAccount = function (root, derivePath) {
  var wallet_hdpath
  if (!derivePath) {
    wallet_hdpath = sails.config.bip.eos_derive_path;
  } else {
    wallet_hdpath = derivePath;
  }
  var wallet = root.derivePath(wallet_hdpath).getWallet();
  var address = '0x' + wallet.getAddress().toString("hex");
  var privateKey = wallet.getPrivateKey().toString("hex");
  var publicKey = wallet.getPublicKey().toString("hex");
  return { coin: "EOS", privateKey: privateKey, publicKey: publicKey, address: address };
}

walletUtil.getETHAccount = function (root, derivePath) {
  var wallet_hdpath
  if (!derivePath) {
    wallet_hdpath = sails.config.bip.eth_derive_path;
  } else {
    wallet_hdpath = derivePath;
  }
  var wallet = root.derivePath(wallet_hdpath).getWallet();
  var address = '0x' + wallet.getAddress().toString("hex");
  var privateKey = wallet.getPrivateKey().toString("hex");
  var publicKey = wallet.getPublicKey().toString("hex");
  return { coin: "ETH", privateKey: privateKey, publicKey: publicKey, address: address };
}



walletUtil.getETCAccount = function (root, derivePath) {
  var wallet_hdpath;
  if (!derivePath) {
    wallet_hdpath = sails.config.bip.etc_derive_path;
  } else {
    wallet_hdpath = derivePath;
  }
  var wallet = root.derivePath(wallet_hdpath).getWallet();
  var address = '0x' + wallet.getAddress().toString("hex");
  var privateKey = wallet.getPrivateKey().toString("hex");
  var publicKey = wallet.getPublicKey().toString("hex");
  return { coin: "ETC", privateKey: privateKey, publicKey: publicKey, address: address };
}

walletUtil.getLTCAccount = function (root, derivePath) {
  var child;
  if (!derivePath) {
    child = root.derivePath(sails.config.bip.ltc_derive_path);
  } else {
    child = root.derivePath(derivePath);
  }
  return { coin: "LTC", privateKey: child.toWIF(), publicKey: child.publicKey.toString("hex"), address: bitcoin.payments.p2pkh({ pubkey: child.publicKey, network: sails.config.bip.ltc_network }).address };
}


module.exports = walletUtil