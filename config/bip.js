 module.exports.bip = {
     //bip39账号生成的derivePath start
   ltc_derive_path                : "m/44'/2'/0'/0/0",
   etc_derive_path                : "m/44'/61'/0'/0/0",
   eth_derive_path                : "m/44'/60'/0'/0/0",
   //to do 这里一定不正确 token_derive_path
   eos_derive_path                : "m/44'/60'/0'/0/0",
   elot_derive_path               : "m/44'/60'/0'/0/0",
   btc_derive_path                : "m/44'/0'/0'/0/0",
   usdt_derive_path               : "m/44'/200'/0'/0/0",
   btctestnet_derive_path         : "m/44'/1'/0'/0/0",
   bch_derive_path                : "m/44'/145'/0'/0/0",
   //bip39账号生成的derivePath end

   //ltc网络hash映射配置
   ltc_network                  : 
   {
    messagePrefix: '\x19Litecoin Signed Message:\n',
    bip32: {
        public: 0x019da462,
        private: 0x019d9cfe
      },
    pubKeyHash: 0x30,
    scriptHash: 0x32,
    wif: 0xb0
   },

}