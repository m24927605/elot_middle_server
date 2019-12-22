const ETHUtil = require('../../utils/ETHUtil');
const AssetUtil = require('../../utils/AssetUtil');
const CommonUtil = require('../../utils/CommonUtil');
const BatchUtil = require('../../utils/BatchUtil');
const TradeAssetUtil = require('../../utils/TradeAssetUtil');
const TradeUpdateBalance = require('../Trade/TradeUpdateBalance');
const Cache = require('../../utils/CacheUtil');

class ETHBlockComfirmation {
    constructor() {
        ETHBlockComfirmation.instance = this;
        this.txinfo = null;
    }

    getAccount(account) {
        return account.ETHAccount;
    }

    getReceiveObjFromConfrimMQ() {
        return BatchUtil.getFromMQ(sails.config.mq.confirm_mq_eth, 10)
    }

    async checkInputData(receiveObject, mqid) {
        sails.log.info('[ETHBlockComfirmation.checkInputData] start: userid ' + receiveObject.userid);
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
        } else {
            receiveObject.balance = CommonUtil.trimDecimal(receiveObject.balance, sails.config.asset.asset_decimal);
        }

        if (!receiveObject.blockNumber) {
            return false;
        }

        let validateRes;
        validateRes = await ETHUtil.validateaddress(receiveObject.account.ETHAccount.address);
        if (!validateRes) {
            return false;
        }
        sails.log.info('[ETHBlockComfirmation.checkInputData] end: respones ' + true);
        return true;
    }

    getCurrentBlock() {
        sails.log.info('[ETHBlockComfirmation.getCurrentBlock] start ');
        return WalletETHService.getCurrentBlock();
    }

    markNotInProcess(account) {
        sails.log.debug('[ETHBatchReceiveByInWallet.markNotInProcess] start: address' + account.ETHAccount.address);
        return BatchUtil.markAccountNotInProcess(account.ETHAccount.address);
    }

    async isConfirm(transactionblock, currentBlock, receiveObject,id) {
        sails.log.info('[ETHBlockComfirmation.isConfirm] start: transactionblock:' + transactionblock + '  currentBlock:' + currentBlock + ' confirm: ' + (currentBlock - transactionblock));
        this.txinfo = await Cache.getTxs(receiveObject.account.ETHAccount.address, receiveObject.assetname);
        if (this.txinfo == null) {
            let blockNum = await BatchUtil.getAddressBlockNumber(receiveObject.account.ETHAccount.address, receiveObject.assetname);
            sails.log.info('[ETHBlockComfirmation.isConfirm] blockNum: ' + blockNum);
            if (!blockNum || blockNum == 'undefined' || blockNum == 'null') {
                blockNum = 0;
            }
            const txs = await ETHUtil.listTxByAddress(receiveObject.account.ETHAccount.address, parseInt(blockNum));
            this.txinfo = await ETHUtil.pickTxForDeposit(txs, receiveObject.account.ETHAccount.address);
            if (!this.txinfo.txs || this.txinfo.txs.length == 0) {
                await BatchUtil.markAccountNotInProcess(receiveObject.account.ETHAccount.address);
                await AssetUtil.setReceiveAddressStatus(receiveObject.account.ETHAccount.address, false);
                await BatchUtil.removeFromMQ(sails.config.mq.confirm_mq_eth, id);
                return false;
            } else {
                await Cache.setTxs(receiveObject.account.ETHAccount.address, receiveObject.assetname, this.txinfo);
                await BatchUtil.setAddressBlockNumber(receiveObject.account.ETHAccount.address, receiveObject.assetname, this.txinfo.blockNumber);
            }
        }

        sails.log.info('[ETHBlockComfirmation.isConfirm] txinfo: ' + JSON.stringify(this.txinfo));
        receiveObject.confirmedBlock = currentBlock - this.txinfo.blockNumber;
        receiveObject.confirmBlockNumber = sails.config.ETH.confirmBlockNumer;

        TradeAssetUtil.addChangedInfoToMq(receiveObject.userid, null, null, null, null, null, null, receiveObject);
        if (receiveObject.confirmedBlock >= sails.config.ETH.confirmBlockNumer) {
            receiveObject.balance = CommonUtil.trimDecimal(this.txinfo.total, sails.config.asset.asset_decimal);
            receiveObject.txs = this.txinfo.txs;
            sails.log.info('[ETHBlockComfirmation.getCurrentBlock] detail: call TradeUpdateBalance class');
            let updateBalanceProcessor = new TradeUpdateBalance(receiveObject.userid, receiveObject.assetname, sails.config.trader.business_deposit, receiveObject.balance, receiveObject.detail);
            updateBalanceProcessor.updateBalance();
            await Cache.setTxs(receiveObject.account.ETHAccount.address, receiveObject.assetname, null);
            return true;
        } else {
            return false;
        }
    }

    initAssetHistory(userid, balance, txid) {
        sails.log.info('[ETHBlockComfirmation.initAssetHistory] start: userid ' + userid + ' balance: ' + balance + ' txid: ' + txid);
        return AssetUtil.initAssetHistoryUnchecked(userid, sails.config.asset.assets_eth_name, balance, txid, sails.config.asset.assets_history_side_deposit, sails.config.asset.assets_history_state_deposited_unchecked);
    }

    updateAsset(userid, balance) {
        sails.log.info('[ETHBlockComfirmation.updateAsset] start: userid ' + userid + ' balance: ' + balance);
        const asset = {};
        asset.userid = userid;
        asset.ethAvailable = balance;
        return AssetUtil.updateAssetReceive(userid, asset, 'ethAvailable');
    }

    initAssetHistoryInRedis(userid, assetHistory, assetHistoryDate) {
        sails.log.info('[ETHBlockComfirmation.initAssetHistoryInRedis] start: userid ' + userid + ' assetHistory: ' + JSON.stringify(assetHistory) + ' assetHistoryDate:' + assetHistoryDate);
        return AssetUtil.updateAssetHistoryInRedis(userid, assetHistory, assetHistoryDate, sails.config.asset.assets_history_state_deposited_unchecked);
    }

    updateAssetInRedis(userid, asset) {
        sails.log.info('[ETHBlockComfirmation.updateAssetInRedis] start: userid ' + userid + ' asset: ' + JSON.stringify(asset));
        return AssetUtil.updateAssetInRedis(userid, asset);
    }

    removeReceiveObjectFromConfirmMQ(id) {
        sails.log.info('[ETHBlockComfirmation.removeReceiveObjectFromConfirmMQ] start: mqid ' + id);
        return BatchUtil.removeFromMQ(sails.config.mq.confirm_mq_eth, id);
    }

    addReceiveObjectToInWalletMQ(receiveObject) {
        sails.log.info('[ETHBlockComfirmation.addReceiveObjectToInWalletMQ] start: mq name ' + sails.config.mq.inwallet_mq_eth);
        return BatchUtil.putToMQ(sails.config.mq.inwallet_mq_eth, JSON.stringify(receiveObject));
    }

    createAssetTx(receiveObject) {
        sails.log.info('[ETHBlockComfirmation.createAssetTx] start: userid ' + receiveObject.userid + ' assetname: ' + receiveObject.assetname + ' balance : ' + receiveObject.balance + ' txid: ' + receiveObject.txid);
        return TradeAssetUtil.submitAssetTx(receiveObject.userid, receiveObject.assetname, receiveObject.balance, receiveObject.txid, sails.config.asset.assets_side_deposit, receiveObject.txs);
    }

    createAssetTxInRedis(assetTx, receiveObject) {
        sails.log.info('[ETHBlockComfirmation.createAssetTxInRedis] start: usderid: ' + receiveObject.userid + ' txid: ' + receiveObject.txid + ' assetTx: ' + JSON.stringify(assetTx));
        TradeAssetUtil.addChangedInfoToMq(receiveObject.userid, null, null, null, null, null, null, null, assetTx);
        return TradeAssetUtil.updateAssetTxInRedis(receiveObject.userid, receiveObject.txid, assetTx);
    }

    sendToInWallet(account, balance) {
        sails.log.info('[ETHBlockComfirmation.sendToInWallet] start: account: *** balance: ' + balance);
        const gasPrice = ETHUtil.getReceiveGasPriceByGwei();
        const pk = account.privateKey;
        const to = sails.config.ETH.inAddress;
        const amount = CommonUtil.subtract(balance, sails.config.ETH.receiveTransferFee).toString();
        return WalletETHService.transferWithBalanceCheck(to, pk, gasPrice, amount);
    }
}
module.exports = ETHBlockComfirmation;

