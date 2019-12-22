
module.exports.globals = {
  coins: ['BTC', 'ETH', 'EOS', 'ELOT'],
  eth_transfer_gasLimit: 21000,
  token_transfer_gasLimit: 60000,
  web3_http_provider: 'https://mainnet.infura.io/v3/dd7e77cc740a4a32ab3c94d9a08b90ae',
  ether_scan_txlist: 'https://api.etherscan.io/api?module=account&action=txlist',
  ether_scan_txlistinternal: 'https://api.etherscan.io/api?module=account&action=txlistinternal',
  ether_scan_tokentx: 'https://api.etherscan.io/api?module=account&action=tokentx',
  ether_scan_apikey: 'TPEYRAUFFCT18RFHWSCTQ3WRR1WXKAI2QB',
  gas_tanker_privatekey: '0812884E612D9A6320CBAF27D86B0F46657253BBCD4AAE962E3B8B7199381FD4',
  gas_tanker_address: '0xdD3839E87ae36804467E69e055e56a792A2ce366',
  gas_tanker_transferfee: 0.0006,
  erc20Interface_json: 'assets/contract/ERC20Interface.json',
  btc_current_net: 1,
  bitcore: {
    url: 'https://blockexplorer.com/api/',
    is_address_valid: 'addr/',
    get_info: 'status?q=getInfo',
    get_tx_unspent: '/utxo',
    get_balance: '/balance',
    get_address_balance: 'addr/',
    send_tx: 'tx/send',
    get_tx: 'tx/'
  },
  riskSchedule: '*/30 * * * * *',
  otp_key: 'MNFDSILLORJF2NDXENZTUURUOJJUG23BJNKSQS2VIURUCYLINFKQ',
};