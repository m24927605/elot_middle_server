var config = function(){};
config.host = 'localhost';
config.port = '1336';
config.viabtc_url  = 'http://localhost:18080';

config.btc_ant_num = 4;
config.btc_from    = { address:'myyn6Tw9UpcdM7LCos7qVjWi31Fxrr2GzG', pk:'cQnaonFUexs6vXrzjEeyphJFpdL9KP9NKNHFTYEuYEk3fSzaYqN8',fee:'0.0002',size:['0.01232454','0.00932454','0.01100004','0.00632454','0.002']}
config.btc_to      = { address:'mvN6B6c94wu7K46A36mFARFtsni2bssKeN', pk:'cR7a7HAzq7XbEHXJ9BuYou1pUghwhBhTUcAVLeirDpsryEaZ2x2q',fee:'0.0002',size:['0.01232454','0.00932454','0.01100004','0.00632454','0.002']}

config.eth_ant_num = 2;
config.eth_sources = [
                        {from:'0xAfC28904Fc9fFbA207181e60a183716af4e5bce2',pk:'aa131fa63c03c6afce225a3e20afad28d1ba7d97ddbad9067e392d7e64847e9e',gasprice:'10', amount:'0.008999987788999888'},
                        {from:'0xE7bFC1B09d8dE024ed9D5CA73379E42a89c53a26',pk:'1BA9C66F572FCB8124A39CC334485699D64C09506F062171DD301432A4E57E05',gasprice:'10', amount:'0.011000000000000005'},
                    ];
                    
config.token_ant_num = 2;
config.token_sources = [
    {assetname:'EOS',from:'0xAfC28904Fc9fFbA207181e60a183716af4e5bce2',pk:'aa131fa63c03c6afce225a3e20afad28d1ba7d97ddbad9067e392d7e64847e9e',gasprice:'10', amount:'99.75436789'},
    {assetname:'EOS',from:'0xA47EA6881A41F3ce5e610478132f8fd8F03EF198',pk:'762D0D2F785888EF98E7E66A851951E4650C18B94480A994038C2F41FFBC7F18',gasprice:'10', amount:'100'}];

module.exports = config;