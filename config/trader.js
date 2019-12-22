module.exports.trader = {
  trade_server: 'http://127.0.0.1:18080',
  global_price: 'https://api.coinmarketcap.com/v2/ticker/?limit=10',
  order_limit: 'order.put_limit',
  balance_update: 'balance.update',
  balance_query: 'balance.query',
  order_pending: 'order.pending',
  order_cancel: 'order.cancel',
  order_finished: 'order.finished',
  order_pending: 'order.pending',
  order_finished_detail: 'order.finished_detail',
  order_pending_detail: 'order.pending_detail',
  order_deals: 'order.deals',
  market_user_deals: 'market.user_deals',
  order_book: 'order.book',
  business_deposit: 'deposit',
  business_withdraw: 'withdraw',
  trade_external_flag: 1,
  trade_internal_flag: 2,
  market: ['EOSBTC', 'EOSETH', 'ETHBTC'],
  market_param: {
    EOSBTC: { asset: 'EOS', money: 'BTC', EOS: 2, BTC: 6 },
    EOSETH: { asset: 'EOS', money: 'ETH', EOS: 2, ETH: 6 },
    ETHBTC: { asset: 'ETH', money: 'BTC', ETH: 3, BTC: 5 },
    BTCETH: { asset: 'BTC', money: 'ETH', ETH: 3, BTC: 5 }
  },
  pairs: ['EOS-BTC', 'EOS-ETH', 'ETH-BTC','BTC-ETH'],
  traderBalance: {
    ETH: { markets: ['ETH-BTC'], available: 0, frozen: 0, coin: 'ETH', name: 'Ethereum', price: 0, img: './images/image_eth.png' },
    BTC: { available: 0, frozen: 0, coin: 'BTC', name: 'Bitcoin', price: 0, img: './images/image_btc.png' },
    EOS: { markets: ['EOS-BTC', 'EOS-ETH'], available: 0, frozen: 0, coin: 'EOS', name: 'EOS', price: 0, img: './images/image_eos.png' }
  }

};