let assert = require('assert');
let config = require('../config');
let rpc, host,port,url,ETHUtil,CommonUtil,AssetUtil,DBUtil,RedisUtil;
let users=[],ethAddrs=[];
describe('Test ETH hot wallet ', function() {
 
  before(function() {
    host       = config.host;
    port       = config.port;
    url        = 'http://'+host+':'+port+'/';
    rpc        = require('./RPCUtil');
    ETHUtil    = require('../../../api/utils/ETHUtil');
    CommonUtil = require('../../../api/utils/CommonUtil');
    AssetUtil  = require('../../../api/utils/AssetUtil');
    DBUtil     = require('../../../api/utils/DBUtil'); 
    RedisUtil  = require('../../../api/utils/RedisUtil');
   });

    it('test return wallet and userid', async function() {
       for(i=0;i<config.eth_ant_num;i++){
        var data = {password:"test",repeatPassword:"test",email:i+'eric'+new Date().getTime()+'@eth.com'};
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
        ethAddrs.push(resp.user.wallet.ETHAccount.address);
       }
    });

    it('test add  ETH request', async function() {
      for(var i =0 ; i< users.length ; i++ ){
        var data = {userid:users[i],assetname:"ETH"};
        var uri = url +'receive';
        let resp = await rpc.PostV2(data,uri);
        assert.notEqual(resp, null);
        assert.notEqual(resp.state, null);
      }
    });

    it('test transfer ETH to receive address', async function() {
      let ethReq = config.eth_sources;
      for( var i = 0; i< ethAddrs.length ; i++){
        let hash = await ETHUtil.transfer(ethReq[i].from,ethAddrs[i],ethReq[i].pk,ethReq[i].gasprice,ethReq[i].amount);
        assert.notEqual(hash, null);
      } 
    });

    it('test locking the account', async function() {
      while(true){
        await CommonUtil.sleep(1000);
        let number =0;
        for (let index = 0; index < ethAddrs.length; index++) {
          let resp = await AssetUtil.getReceiveAddressStatus( ethAddrs[index] );
          if(String(resp).toUpperCase() === String( 'true' ).toUpperCase() ){
            number++;
          }
        }
        if( number == config.eth_ant_num ){
          break;
        }
      }

      for (let index = 0; index < ethAddrs.length; index++) {
        let resp = await AssetUtil.getReceiveAddressStatus( ethAddrs[index] );
        assert.equal( String(resp).toUpperCase(), String( 'true' ).toUpperCase() );
      }
    });

    it('test unlocking the account', async function() {
      while(true){
        await CommonUtil.sleep(1000);
        let number =0;
        for (let index = 0; index < ethAddrs.length; index++) {
          let resp = await AssetUtil.getReceiveAddressStatus( ethAddrs[index] );
          if(String(resp).toUpperCase() === String( 'false' ).toUpperCase() ){
            number++;
          }
        }
        if( number == config.eth_ant_num ){
          break;
        }
      }
      for (let index = 0; index < ethAddrs.length; index++) {
        let resp = await AssetUtil.getReceiveAddressStatus( ethAddrs[index] );
        assert.equal( String(resp).toUpperCase(), String( 'false' ).toUpperCase() );
      }
    });

    it('test comparing the asset in middleserver with ViaBTC server ', async function() {
      for (let index = 0; index < users.length; index++) {
        let resp_ms = await rpc.PostV2({userid:users[index]},url + 'trade/getBalance');
        let ethAvailable_ms = resp_ms.ethAvailable;
        let resp_vs = await rpc.Post({id:10,method:"balance.query",params:[ parseInt(users[index]) ]},config.viabtc_url); 
        let ethAvailable_vs = resp_vs.result.ETH.available;
        assert.equal( ethAvailable_ms, ethAvailable_vs );
      }
    });

    it('test submit withdraw request ', async function() {
      for (let index = 0; index < config.eth_sources.length; index++) {
        var wthwReq = {
          userid:users[index],
          assetname:"ETH",
          size: CommonUtil.trimDecimal(config.eth_sources[index].amount,8),
          address:config.eth_sources[index].from }
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
        if( number == config.eth_ant_num ){
          break;
        } 
      }
      await CommonUtil.sleep(10000);
      for ( let index = 0; index < users.length; index++ ) {
        let resp_ms = await rpc.PostV2({userid:users[index]},url + 'trade/getBalance');
        let ethAvailable_ms = resp_ms.ethAvailable;
        let resp_vs = await rpc.Post({id:10,method:"balance.query",params:[ parseInt(users[index]) ]},config.viabtc_url); 
        let ethAvailable_vs = resp_vs.result.ETH.available;
        assert.equal( ethAvailable_ms, ethAvailable_vs );
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


 