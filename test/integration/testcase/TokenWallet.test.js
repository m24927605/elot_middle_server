let assert = require('assert');
let config = require('../config');
let rpc, host,port,url,TokenUtil,CommonUtil,AssetUtil,DBUtil,RedisUtil;
let users=[],tokenAddrs=[];
describe('Test Token hot wallet ', function() {
 
  before(function() {
    host       = config.host;
    port       = config.port;
    url        = 'http://'+host+':'+port+'/';
    rpc        = require('./RPCUtil');
    TokenUtil  = require('../../../api/utils/TokenUtil');
    CommonUtil = require('../../../api/utils/CommonUtil');
    AssetUtil  = require('../../../api/utils/AssetUtil');
    DBUtil     = require('../../../api/utils/DBUtil'); 
    RedisUtil  = require('../../../api/utils/RedisUtil');
   });

    it('test return wallet and userid', async function() {
       for(i=0;i<config.token_ant_num;i++){
        var data = {password:"test",repeatPassword:"test",email:i+'eric'+new Date().getTime()+'@token.com'};
        var uri = url + 'users';
        let resp = await rpc.PostV2(data,uri);
        assert.notEqual(resp, null);
        assert.notEqual(resp.user, null);
        assert.notEqual(resp.user.userid, null);
        assert.notEqual(resp.user.wallet, null);
        assert.notEqual(resp.user.wallet.ETHAccount.address, null);
        assert.notEqual(resp.user.wallet.BTCAccount.address, null);
        assert.notEqual(resp.user.email, null);
        users.push(resp.user.userid);
        tokenAddrs.push(resp.user.wallet.ETHAccount.address);
       }
    });

    it('test add EOS Token request', async function() {
      for(var i =0 ; i< users.length ; i++ ){
        var data = {userid:users[i],assetname:"EOS"};
        var uri = url +'receive';
        let resp = await rpc.PostV2(data,uri);
        assert.notEqual(resp, null);
        assert.notEqual(resp.state, null);
      }
    });

    it('test transfer Token to receive address', async function() {
      let tokenReq = config.token_sources;
      for( var i = 0; i< tokenAddrs.length ; i++){
        let hash = await TokenUtil.transferWithBalanceCheck(tokenAddrs[i],tokenReq[i].pk,tokenReq[i].gasprice,tokenReq[i].amount,'EOS');
        assert.notEqual(hash, null);
      } 
    });

    it('test locking the account', async function() {
      while(true){
        await CommonUtil.sleep(1000);
        let number =0;
        for (let index = 0; index < tokenAddrs.length; index++) {
          let resp = await AssetUtil.getReceiveAddressStatus( tokenAddrs[index] );
          if(String(resp).toUpperCase() === String( 'true' ).toUpperCase() ){
            number++;
          }
        }
        if( number == config.token_ant_num ){
          break;
        }
      }

      for (let index = 0; index < tokenAddrs.length; index++) {
        let resp = await AssetUtil.getReceiveAddressStatus( tokenAddrs[index] );
        assert.equal( String(resp).toUpperCase(), String( 'true' ).toUpperCase() );
      }
    });

    it('test unlocking the account', async function() {
      while(true){
        await CommonUtil.sleep(1000);
        let number =0;
        for (let index = 0; index < tokenAddrs.length; index++) {
          let resp = await AssetUtil.getReceiveAddressStatus( tokenAddrs[index] );
          if(String(resp).toUpperCase() === String( 'false' ).toUpperCase() ){
            number++;
          }
        }
        if( number == config.token_ant_num ){
          break;
        }
      }
      for (let index = 0; index < tokenAddrs.length; index++) {
        let resp = await AssetUtil.getReceiveAddressStatus( tokenAddrs[index] );
        assert.equal( String(resp).toUpperCase(), String( 'false' ).toUpperCase() );
      }
    });

    it('test comparing the asset in middleserver with ViaBTC server ', async function() {
      for (let index = 0; index < users.length; index++) {
        let resp_ms = await rpc.PostV2({userid:users[index]},url + 'trade/getBalance');
        let eosAvailable_ms = resp_ms.eosAvailable;
        let resp_vs = await rpc.Post({id:10,method:"balance.query",params:[ parseInt(users[index]) ]},config.viabtc_url); 
        let eosAvailable_vs = resp_vs.result.EOS.available;
        assert.equal( eosAvailable_ms, eosAvailable_vs );
      }
    });

    it('test submit withdraw request ', async function() {
      for (let index = 0; index < config.token_sources.length; index++) {
        var wthwReq = {userid:users[index],assetname:"EOS",size:new Number(config.token_sources[index].amount).toFixed(8),address:config.token_sources[index].from }
        let resp_wthwReq = await rpc.PostV2(wthwReq,url + 'send');
        assert.notEqual(resp_wthwReq, null);
      }
    });

    it('test after withdrawing,the balance of viabtc server and middle server should be equal', async function() {
      while(true){
        await CommonUtil.sleep(1000);
        let number =0;
        for (let index = 0; index < users.length; index++) {
          let resp = await RedisUtil.hgetall( 'asset_tx_redis_hashkey_'+users[index])
          if(resp){
            number ++
          }
        }
        if( number == config.token_ant_num ){
          break;
        } 
      }
      await CommonUtil.sleep(10000);
      for ( let index = 0; index < users.length; index++ ) {
        let resp_ms = await rpc.PostV2({userid:users[index]},url + 'trade/getBalance');
        let eosAvailable_ms = resp_ms.eosAvailable;
        let resp_vs = await rpc.Post({id:10,method:"balance.query",params:[ parseInt(users[index]) ]},config.viabtc_url); 
        let eosAvailable_vs = resp_vs.result.EOS.available;
        assert.equal( eosAvailable_ms, eosAvailable_vs );
      }
    });

    it('test compare asset tx value which should be confirmed and withdraw and deposit should equal ', async function() {
      await CommonUtil.sleep(20000);
      for ( let index = 0; index < users.length; index++ ) {
        let assettx = await DBUtil.loadAssetTx({userid:users[index]})
        let wthwSize = 0;
        let depoSize = 0;
        for(var i = 0; i < assettx.length ; i++ ){
          //assert.equal(assettx[i].status, 'CONFIRMED');
          if( assettx[i].side === '1'){
            depoSize = depoSize + parseFloat(assettx[i].amount);
          }else{
            wthwSize = wthwSize + parseFloat(assettx[i].amount);
          }
        }
        assert.equal( depoSize , wthwSize );
      }
    });

    after( async function() {
      // await CommonUtil.sleep(10000);
      // for (let index = 0; index < users.length; index++) {
      //   DBUtil.testDelete(users[index])
      // }
    });
});


 