let assert = require('assert');
let config = require('../config');
let rpc, host,port,url,BTCUtil,CommonUtil,AssetUtil,DBUtil,RedisUtil;
let users=[],btcAddrs=[];
describe('Test BTC hot wallet ', function() {
 
  before(function() {
        host       = config.host;
        port       = config.port;
        url        = 'http://'+host+':'+port+'/';
        rpc        = require('./RPCUtil');
        BTCUtil    = require('../../../api/utils/BTCUtil');
        CommonUtil = require('../../../api/utils/CommonUtil');
        AssetUtil  = require('../../../api/utils/AssetUtil');
        DBUtil     = require('../../../api/utils/DBUtil'); 
        RedisUtil  = require('../../../api/utils/RedisUtil');
   });

   it('test return wallet and userid', async function() {
        for(i=0;i<config.btc_ant_num;i++){
        var data = {password:"test",repeatPassword:"test",email:i+'eric'+new Date().getTime()+'@btc.com'};
        var uri = url + 'users';
        let resp = await rpc.PostV2(data,uri);
        assert.notEqual(resp, null);
        assert.notEqual(resp.user, null);
        assert.notEqual(resp.user.userid, null);
        assert.notEqual(resp.user.wallet, null);
        assert.notEqual(resp.user.wallet.BTCAccount.address, null);
        assert.notEqual(resp.user.email, null);
        users.push(resp.user.userid);
        btcAddrs.push(resp.user.wallet.BTCAccount.address);
        }
    });

    it('test add BTC request', async function() {
        for(var i =0 ; i< users.length ; i++ ){
          var data = {userid:users[i],assetname:"BTC"};
          var uri = url +'receive';
          let resp = await rpc.PostV2(data,uri);
          assert.notEqual(resp, null);
          assert.notEqual(resp.state, null);
        }
      });

      it('test transfer BTC to receive address', async function() {
        let btcReq = config.btc_to;
        for (let index = 0; index < btcAddrs.length; index++) {
          let hash = await BTCUtil.transfer(btcAddrs[index],btcReq.size[index],btcReq.pk,btcReq.fee);
          assert.notEqual(hash, null);  
          // await CommonUtil.sleep(5000);
        }
      });

      it('test locking the account during deposit process', async function() {
        while(true){
          await CommonUtil.sleep(1000);
          let number =0;
          for (let index = 0; index < btcAddrs.length; index++) {
            let resp = await AssetUtil.getReceiveAddressStatus( btcAddrs[index] );
            if(String(resp).toUpperCase() === String( 'true' ).toUpperCase() ){
              number++;
            }
          }
          if( number == config.btc_ant_num  ){
            break;
          }
        }
        for (let index = 0; index < btcAddrs.length; index++) {
          let resp = await AssetUtil.getReceiveAddressStatus( btcAddrs[index] );
          assert.equal( String(resp).toUpperCase(), String( 'true' ).toUpperCase() );
        }
      });
  
      it('test unlocking the account', async function() {
        while(true){
          await CommonUtil.sleep(10000);
          let number =0;
          for (let index = 0; index < btcAddrs.length; index++) {
            let resp = await AssetUtil.getReceiveAddressStatus( btcAddrs[index] );
            if(String(resp).toUpperCase() === String( 'false' ).toUpperCase() ){
              number++;
            }
          }
          if( number == config.btc_ant_num ){
            break;
          }
        }
        for (let index = 0; index < btcAddrs.length; index++) {
          let resp = await AssetUtil.getReceiveAddressStatus( btcAddrs[index] );
          assert.equal( String(resp).toUpperCase(), String( 'false' ).toUpperCase() );
        }
      });

      it('test comparing the asset in middleserver with ViaBTC server ', async function() {
        for (let index = 0; index < users.length; index++) {
          let resp_ms = await rpc.PostV2({userid:users[index]},url + 'trade/getBalance');
          let btcAvailable_ms = resp_ms.btcAvailable;
          let resp_vs = await rpc.Post({id:10,method:"balance.query",params:[ parseInt(users[index]) ]},config.viabtc_url); 
          let btcAvailable_vs = resp_vs.result.BTC.available;
          assert.equal( btcAvailable_ms, btcAvailable_vs );
        }
      });

      it('test submit BTC withdraw request ', async function() {
        for (let index = 0; index < users.length; index++) {
          var wthwReq = {userid:users[index],assetname:"BTC",size:new Number(config.btc_from.size[index]).toFixed(8), address : config.btc_to.address }
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
          if( number == config.btc_ant_num ){
            break;
          } 
        }

        await CommonUtil.sleep(10000);
        for ( let index = 0; index < users.length; index++ ) {
          let resp_ms = await rpc.PostV2({userid:users[index]},url + 'trade/getBalance');
          let btcAvailable_ms = resp_ms.btcAvailable;
          let resp_vs = await rpc.Post({id:10,method:"balance.query",params:[ parseInt(users[index]) ]},config.viabtc_url); 
          let btcAvailable_vs = resp_vs.result.BTC.available;
          assert.equal( btcAvailable_ms, btcAvailable_vs );
        }
      });

      it('test compare asset tx value which should be confirmed and withdraw and deposit should equal ', async function() {
        await CommonUtil.sleep(20000);
        for ( let index = 0; index < users.length; index++ ) {
          let assettx = await DBUtil.loadAssetTx({userid:users[index]})
          let wthwSize = 0;
          let depoSize = 0;
          for(var i = 0; i < assettx.length ; i++ ){
           // assert.equal(assettx[i].status, 'CONFIRMED');
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