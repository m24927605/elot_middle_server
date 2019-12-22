module.exports = {
  eth: function (address) {
    return WalletETHService.balance(address);
  },
  btc: function (address) {
    return WalletBTCService.balance(address);
  },
  ltc: function (address) {
    return WalletLTCService.balance(address);
  },
  token: function (address, tokenName) {
    //return WalletTokenService.balance(address, tokenName);
    return WalletETHService.balance(address);
  }
}