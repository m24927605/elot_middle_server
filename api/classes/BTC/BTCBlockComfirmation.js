const BatchUtil = require('../../utils/BatchUtil');
const BTCUtil = require('../../utils/BTCUtil');
const AssetUtil = require('../../utils/AssetUtil');
const TradeAssetUtil = require('../../utils/TradeAssetUtil');
const TradeUpdateBalance = require('../Trade/TradeUpdateBalance');
const CommonUtil = require('../../utils/CommonUtil');
const Cache = require('../../utils/CacheUtil');

class BTCBlockComfirmation {
    constructor() {
        BTCBlockComfirmation.instance = this;
        this.txinfo = null;
    }

    getAccount(account) {
        return account.BTCAccount;
    }

    getReceiveObjFromConfrimMQ() {
        //sails.log.info('[BTCBlockComfirmation.getReceiveObjFromConfrimMQ] start: mq name ' + sails.config.mq.confirm_mq_btc );
        return BatchUtil.getFromMQ(sails.config.mq.confirm_mq_btc, 10)
    }

    async checkInputData(receiveObject, mqid) {
        sails.log.info('[BTCBlockComfirmation.checkInputData] start: userid ' + receiveObject.userid);
        if (!mqid) {
            return false;
        }
        if (!receiveObject.timestamp) {
            return false;
        }
        if (!receiveObject.userid) {
            return false;
        }
        if (!receiveObject.assetname) {
            return false;
        }
        if (!receiveObject.account) {
            return false;
        }
        if (!receiveObject.balance) {
            return false;
        }
        if (!receiveObject.blockNumber) {
            return false;
        }
        let validateRes;
        validateRes = await BTCUtil.validateaddress(receiveObject.account.BTCAccount.address)
        if (!validateRes) {
            return false;
        }
        return true;
    }

    getCurrentBlock() {
        sails.log.info('[BTCBlockComfirmation.getCurrentBlock] start');
        return WalletBTCService.getCurrentBlock();
    }

    async isConfirm(transactionblock, currentBlock, receiveObject,id) {
        sails.log.info('[BTCBlockComfirmation.isConfirm] start : transactionblock: ' + transactionblock + ' currentBlock: ' + currentBlock);
        this.txinfo = await Cache.getTxs(receiveObject.account.BTCAccount.address, receiveObject.assetname);
        if (this.txinfo == null) {
            const txs = await BTCUtil.listTxByAddress(receiveObject.account.BTCAccount.address);
            if (Array.isArray(txs) && txs.length > 0) {
                this.txinfo = await BTCUtil.pickTxForDeposit(txs);
                if (!this.txinfo.txs || this.txinfo.txs.length == 0) {
                    await BatchUtil.markAccountNotInProcess(receiveObject.account.BTCAccount.address);
                    await AssetUtil.setReceiveAddressStatus(receiveObject.account.BTCAccount.address, false);
                    await BatchUtil.removeFromMQ(sails.config.mq.confirm_mq_btc, id);
                    return false;
                } else {
                    await Cache.setTxs(receiveObject.account.BTCAccount.address, receiveObject.assetname, this.txinfo);
                }
            }

        }
        receiveObject.confirmedBlock = currentBlock - this.txinfo.blockNumber;
        receiveObject.confirmBlockNumber = sails.config.BTC.confirmBlockNumer;
        TradeAssetUtil.addChangedInfoToMq(receiveObject.userid, null, null, null, null, null, null, receiveObject);
        if (receiveObject.confirmedBlock >= sails.config.BTC.confirmBlockNumer) {

            receiveObject.balance = CommonUtil.trimDecimal(this.txinfo.total, sails.config.asset.asset_decimal);
            receiveObject.txs = this.txinfo.txs;
            const updateBalanceProcessor = new TradeUpdateBalance(receiveObject.userid, receiveObject.assetname, sails.config.trader.business_deposit, receiveObject.balance, receiveObject.detail);
            updateBalanceProcessor.updateBalance();
            await Cache.setTxs(receiveObject.account.BTCAccount.address, receiveObject.assetname, null);
            return true;
        } else {
            return false;
        }
    }
    createAssetTx(receiveObject) {
        sails.log.info('[BTCBlockComfirmation.createAssetTx] start: userid ' + receiveObject.userid + ' assetname: ' + receiveObject.assetname + ' balance : ' + receiveObject.balance + ' txid: ' + receiveObject.txid);
        return TradeAssetUtil.submitAssetTx(receiveObject.userid, receiveObject.assetname, receiveObject.balance, receiveObject.txid, sails.config.asset.assets_side_deposit, receiveObject.txs);
    }
    createAssetTxInRedis(assetTx, receiveObject) {
        sails.log.info('[BTCBlockComfirmation.createAssetTxInRedis] start: usderid: ' + receiveObject.userid + ' txid: ' + receiveObject.txid + ' assetTx: ' + JSON.stringify(assetTx));
        TradeAssetUtil.addChangedInfoToMq(receiveObject.userid, null, null, null, null, null, null, null, assetTx);
        return TradeAssetUtil.updateAssetTxInRedis(receiveObject.userid, receiveObject.txid, assetTx);
    }

    markNotInProcess(account) {
        sails.log.info('[BTCBlockComfirmation.markNotInProcess] start: address' + account.BTCAccount.address);
        return BatchUtil.markAccountNotInProcess(account.BTCAccount.address);
    }

    initAssetHistory(userid, balance, txid) {
        sails.log.info('[BTCBlockComfirmation.initAssetHistory] start: userid ' + userid + ' balance: ' + balance + ' txid:' + txid);
        return AssetUtil.initAssetHistoryUnchecked(
            userid,
            sails.config.asset.assets_btc_name,
            balance,
            txid,
            sails.config.asset.assets_history_side_deposit,
            sails.config.asset.assets_history_state_deposited_unchecked
        );
    }

    updateAsset(userid, balance) {
        sails.log.info('[BTCBlockComfirmation.updateAsset] start: userid ' + userid + ' balance: ' + balance);
        const asset = {};
        asset.userid = userid;
        asset.btcAvailable = balance;
        return AssetUtil.updateAssetReceive(userid, asset, 'btcAvailable');
    }

    initAssetHistoryInRedis(userid, assetHistory, assetHistoryDate) {
        sails.log.info('[BTCBlockComfirmation.initAssetHistoryInRedis] start: userid ' + userid + ' assetHistory: ' + assetHistory + ' assetHistoryDate: ' + assetHistoryDate);
        return AssetUtil.updateAssetHistoryInRedis(userid, assetHistory, assetHistoryDate, sails.config.asset.assets_history_state_deposited_unchecked);
    }

    updateAssetInRedis(userid, asset) {
        sails.log.info('[BTCBlockComfirmation.updateAssetInRedis] start userid ' + userid + ' asset: ' + JSON.stringify(asset));
        return AssetUtil.updateAssetInRedis(userid, asset);
    }

    removeReceiveObjectFromConfirmMQ(id) {
        sails.log.info('[BTCBlockComfirmation.removeReceiveObjectFromConfirmMQ] start mqid ' + id);
        return BatchUtil.removeFromMQ(sails.config.mq.confirm_mq_btc, id);
    }

    addReceiveObjectToInWalletMQ(receiveObject) {
        sails.log.info('[BTCBlockComfirmation.addReceiveObjectToInWalletMQ] start : mqid  ' + sails.config.mq.inwallet_mq_btc);
        return BatchUtil.putToMQ(sails.config.mq.inwallet_mq_btc, JSON.stringify(receiveObject));
    }

    sendToInWallet(account, balance) {
        sails.log.info('[BTCBlockComfirmation.sendToInWallet] start account: **** balance: ' + balance);
        const transactionFee = sails.config.BTC.receiveTransferFee;
        const pk = account.privateKey;
        const to = sails.config.BTC.inAddress;
        const amount = balance - sails.config.BTC.receiveTransferFee;
        let result;
        try {
            result = WalletBTCService.transferWithBalanceCheck(to, amount, pk, transactionFee);
        } catch (exception) {
            sails.log.error('WalletBTCService.transferWithBalanceCheck account:' + account + ' balance: ' + balance, exception);
        }
        return result;
    }
}

module.exports = BTCBlockComfirmation;