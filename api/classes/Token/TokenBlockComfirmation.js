const BatchUtil = require('../../utils/BatchUtil');
const TokenUtil = require('../../utils/TokenUtil');
const AssetUtil = require('../../utils/AssetUtil');
const TradeAssetUtil = require('../../utils/TradeAssetUtil');
const TradeUpdateBalance = require('../Trade/TradeUpdateBalance');
const CommonUtil = require('../../utils/CommonUtil');
const Cache = require('../../utils/CacheUtil');
class TokenBlockComfirmation {
    constructor() {
        TokenBlockComfirmation.instance = this;
        this.receiveObject = null;
        this.index = 0;
    }
    getAccount(account) {
        sails.log.info('[TokenBlockComfirmation.getAccount] start: assetAccountName' + String(this.receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag);
        const assetAccountName = String(this.receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag;
        return account[assetAccountName];
    }
    getReceiveObjFromConfrimMQ() {
        const confirmMQName = sails.config.constant.confirm_mq_flag + String(sails.config.mq.tokens[this.index]).toLowerCase();
        this.index++;
        if (this.index == sails.config.mq.tokens.length) {
            this.index = 0;
        }
        return BatchUtil.getFromMQ(sails.config.mq[confirmMQName], 10)
    }
    createAssetTx(receiveObject) {
        sails.log.info('[TokenBlockComfirmation.createAssetTx] start: userid ' + receiveObject.userid + ' assetname: ' + receiveObject.assetname + ' balance : ' + receiveObject.balance + ' txs:' + JSON.stringify(receiveObject.txs) + ' txid: ' + receiveObject.txid);
        return TradeAssetUtil.submitAssetTx(receiveObject.userid, receiveObject.assetname, receiveObject.balance, receiveObject.txid, sails.config.asset.assets_side_deposit, receiveObject.txs);
    }
    createAssetTxInRedis(assetTx, receiveObject) {
        sails.log.info('[TokenBlockComfirmation.createAssetTxInRedis] start: usderid: ' + receiveObject.userid + ' txid: ' + receiveObject.txid + ' assetTx: ' + JSON.stringify(assetTx));
        TradeAssetUtil.addChangedInfoToMq(this.receiveObject.userid, null, null, null, null, null, null, this.receiveObject, assetTx);
        return TradeAssetUtil.updateAssetTxInRedis(receiveObject.userid, receiveObject.txid, assetTx);
    }
    async checkInputData(receiveObject, mqid) {
        sails.log.info('[TokenBlockComfirmation.checkInputData] start: userid ' + receiveObject.userid + ' mqid : ' + mqid);
        this.receiveObject = receiveObject;
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
        const assetAccountName = String(receiveObject.assetname).toUpperCase() + 'Account';
        if (!receiveObject.account[assetAccountName]) {
            return false;
        }
        let validateRes;
        validateRes = await TokenUtil.validateaddress(receiveObject.account[assetAccountName].address)
        if (!validateRes) {
            return false;
        }
        return true;
    }
    getCurrentBlock() {
        sails.log.info('[TokenBlockComfirmation.getCurrentBlock] start ');
        return WalletTokenService.getCurrentBlock();
    }
    markNotInProcess(account) {
        sails.log.debug('[TokenBlockComfirmation.markNotInProcess] start : address : ' + account[String(this.receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag].address);
        const assetAccountName = String(this.receiveObject.assetname).toUpperCase() + sails.config.constant.account_flag;
        return BatchUtil.markAccountNotInProcess(account[assetAccountName].address);
    }
    async isConfirm(transactionblock, currentBlock, receiveObject,id) {
        sails.log.info('[TokenBlockComfirmation.isConfirm] start: transactionblock ' + transactionblock + ' currentBlock:' + currentBlock + ' confirm:' + (currentBlock - transactionblock));
        const confirmBlock = sails.config[String(this.receiveObject.assetname).toUpperCase()].confirmBlockNumer;
        const assetAccountName = String(receiveObject.assetname).toUpperCase() + 'Account';
        this.txinfo = await Cache.getTxs(receiveObject.account[assetAccountName].address, receiveObject.assetname);
        if (this.txinfo == null) {
            let blockNum = await BatchUtil.getAddressBlockNumber(receiveObject.account[assetAccountName].address, receiveObject.assetname);
            sails.log.info('[TokenBlockComfirmation.isConfirm] blockNum: ' + blockNum);
            if (!blockNum || blockNum == 'undefined' || blockNum == 'null') {
                blockNum = 0;
            }
            const txs = await TokenUtil.listTxByAddress(receiveObject.account[assetAccountName].address, parseInt(blockNum));
            this.txinfo = await TokenUtil.pickTxForDeposit(txs, receiveObject.account[assetAccountName].address, receiveObject.assetname);
            sails.log.info('[TokenBlockComfirmation.isConfirm] txs: ' + JSON.stringify(this.txinfo));
            if (!this.txinfo.txs || this.txinfo.txs.length == 0) {
                await BatchUtil.markAccountNotInProcess(receiveObject.account[assetAccountName].address);
                await AssetUtil.setReceiveAddressStatus(receiveObject.account[assetAccountName].address, false);
                const confirmMQName = sails.config.constant.confirm_mq_flag + String(this.receiveObject.assetname).toLowerCase();
                await BatchUtil.removeFromMQ(sails.config.mq[confirmMQName], id);
                return false;
            } else {
                await Cache.setTxs(receiveObject.account[assetAccountName].address, receiveObject.assetname, this.txinfo);
                await BatchUtil.setAddressBlockNumber(receiveObject.account[assetAccountName].address, receiveObject.assetname, this.txinfo.blockNumber);
            }
        }

        receiveObject.txs = this.txinfo.txs;
        this.receiveObject.confirmedBlock = currentBlock - this.txinfo.blockNumber;
        this.receiveObject.confirmBlockNumber = confirmBlock;
        TradeAssetUtil.addChangedInfoToMq(this.receiveObject.userid, null, null, null, null, null, null, this.receiveObject);
        if (this.receiveObject.confirmedBlock >= confirmBlock) {
            sails.log.info('[TokenBlockComfirmation.getCurrentBlock] detail: call TradeUpdateBalance class');
            const tmpBalance = await WalletTokenService.balance(this.receiveObject.address, this.receiveObject.assetname);
            this.receiveObject.balance = CommonUtil.trimDecimal(tmpBalance, sails.config.asset.asset_decimal);
            const updateBalanceProcessor = new TradeUpdateBalance(this.receiveObject.userid, this.receiveObject.assetname, sails.config.trader.business_deposit, this.receiveObject.balance, this.receiveObject.detail);
            updateBalanceProcessor.updateBalance();
            await Cache.setTxs(receiveObject.account[assetAccountName].address, receiveObject.assetname, null);
            return true;
        } else {
            return false;
        }
    }
    initAssetHistory(userid, balance, txid) {
        sails.log.info('[TokenBlockComfirmation.initAssetHistory] start: userid' + userid + ' balance: ' + balance + ' txid: ' + txid);
        return AssetUtil.initAssetHistoryUnchecked(
            userid,
            this.receiveObject.assetname,
            balance,
            txid,
            sails.config.asset.assets_history_side_deposit,
            sails.config.asset.assets_history_state_deposited_unchecked
        );
    }
    updateAsset(userid, balance) {
        sails.log.info('[TokenBlockComfirmation.updateAsset] start: userid ' + userid + ' balance: ' + balance);
        const asset = {};
        const assetAvailableName = String(this.receiveObject.assetname).toLowerCase() + 'Available';
        asset.userid = userid;
        asset[assetAvailableName] = balance;
        return AssetUtil.updateAssetReceive(userid, asset, assetAvailableName);
    }
    initAssetHistoryInRedis(userid, assetHistory, assetHistoryDate) {
        sails.log.info('[TokenBlockComfirmation.initAssetHistoryInRedis] start: userid ' + userid + ' assetHistory: ' + JSON.stringify(assetHistory) + ' assetHistoryDate:' + assetHistoryDate);
        return AssetUtil.updateAssetHistoryInRedis(userid, assetHistory, assetHistoryDate, sails.config.asset.assets_history_state_deposited_unchecked);
    }
    updateAssetInRedis(userid, asset) {
        sails.log.info('[TokenBlockComfirmation.updateAssetInRedis] start: userid ' + userid + ' asset:' + JSON.stringify(asset));
        return AssetUtil.updateAssetInRedis(userid, asset);
    }
    removeReceiveObjectFromConfirmMQ(id) {
        sails.log.info('[TokenBlockComfirmation.removeReceiveObjectFromConfirmMQ] start confirmMQName ' + sails.config.constant.confirm_mq_flag + String(this.receiveObject.assetname).toLowerCase());
        const confirmMQName = sails.config.constant.confirm_mq_flag + String(this.receiveObject.assetname).toLowerCase();
        return BatchUtil.removeFromMQ(sails.config.mq[confirmMQName], id);
    }
    addReceiveObjectToInWalletMQ(receiveObject) {
        sails.log.info('[TokenBlockComfirmation.addReceiveObjectToInWalletMQ] start : inwalletMQName ' + sails.config.constant.inwallet_mq_flag + String(this.receiveObject.assetname).toLowerCase());
        const inwalletMQName = sails.config.constant.inwallet_mq_flag + String(this.receiveObject.assetname).toLowerCase();
        return BatchUtil.putToMQ(sails.config.mq[inwalletMQName], JSON.stringify(receiveObject));
    }
    sendToInWallet(account, balance) {
        sails.log.info('[TokenBlockComfirmation.sendToInWallet] start : balance ' + balance);
        const gasPrice = TokenUtil.getReceiveGasPriceByGwei(sails.config[String(this.receiveObject.assetname).toUpperCase()].sendTransferFee);
        const pk = account.privateKey;
        const to = sails.config[String(this.receiveObject.assetname).toUpperCase()].inAddress;
        const amount = balance;
        let result;
        try {
            result = WalletTokenService.transferWithBalanceCheck(to, pk, gasPrice, amount, this.receiveObject.assetname);
        } catch (exception) {
            sails.log.error('WalletTokenService.transferWithBalanceCheck account:' + account + ' balance: ' + balance);
            sails.log.error(exception);
        }
        return result;
    }
}
module.exports = TokenBlockComfirmation;
