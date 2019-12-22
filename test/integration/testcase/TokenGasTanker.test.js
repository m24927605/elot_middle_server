let assert = require('assert');
let config = require('../config');
let rpc, host,port,url,TokenUtil,CommonUtil,AssetUtil,DBUtil,RedisUtil,GasTankerService;
let users=[],tokenAddrs=[];

describe('Test GAS Tanker API Test ', function() {
    before(function() {
        host             = config.host;
        port             = config.port;
        url              = 'http://'+host+':'+port+'/';
        rpc              = require('./RPCUtil');
        TokenUtil        = require('../../../api/utils/TokenUtil');
        CommonUtil       = require('../../../api/utils/CommonUtil');
        AssetUtil        = require('../../../api/utils/AssetUtil');
        DBUtil           = require('../../../api/utils/DBUtil'); 
        RedisUtil        = require('../../../api/utils/RedisUtil');
        GasTankerService = require('../../../api/services/WalletGasTankerService');
    });

    it('test return wallet and userid', async function() {
        for(i=0;i<config.token_ant_num;i++){
        var data = {password:"test",repeatPassword:"test",email:i+'eric'+new Date().getTime()+'@btc.com'};
        var uri = url + 'users';
        let resp = await rpc.PostV2(data,uri);
        assert.notEqual(resp, null);
        assert.notEqual(resp.user, null);
        assert.notEqual(resp.user.userid, null);
        assert.notEqual(resp.user.wallet, null);
        assert.notEqual(resp.user.wallet.ETHAccount.address, null);
        assert.notEqual(resp.user.email, null);
        users.push(resp.user.userid);
        tokenAddrs.push(resp.user.wallet.ETHAccount.address);
        }
    });

    it('test add gas tanker request', async function() {
        for(var i =0 ; i< users.length ; i++ ){
            var gasTankerObject = {};
            gasTankerObject.timestamp = new Date().getTime(); 
            gasTankerObject.userid    = users[i];
            gasTankerObject.assetname = 'EOS'
            gasTankerObject.address   = tokenAddrs[i];
            gasTankerObject.size      = '0.0006'
            var resp = await GasTankerService.addGasTankerMQ(gasTankerObject);
            assert.notEqual(resp, null);
        }
    });
});

