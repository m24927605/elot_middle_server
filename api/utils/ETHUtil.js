const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const _ = require('lodash');
const RedisUtil = require('../utils/RedisUtil');
const CommonUtil = require('../utils/CommonUtil');
const JsonRPCUtil = require('../utils/JsonRPCUtil');
const web3 = new Web3(new Web3.providers.HttpProvider(sails.config.globals.web3_http_provider));
const gasLimit = sails.config.globals.eth_transfer_gasLimit;
const ETHUtil = () => { };
ETHUtil.pickTxForDeposit = (txs, address) => {
    sails.log.info('[ETHUtil.pickTxForDeposit] start  txs:' + JSON.stringify(txs) + ' address: ' + address);
    return new Promise((resolve, reject) => {
        if (!Array.isArray(txs)) {
            return reject('txs_not_array');
        }
        txs = _.reverse(_.sortBy(txs, [(tx) => { return tx.blockNumber; }]));
        const depositTx = {};
        let total = 0;
        for (let index = 0; index < txs.length; index++) {
            const tx = txs[index];
            if (index === 0) {
                depositTx.blockNumber = tx.blockNumber;
                depositTx.txs = [];
            }
            if (tx.to === address
                && tx.value > 0
                && String(tx.from).toUpperCase() != String(sails.config.globals.gas_tanker_address).toUpperCase()) {
                total = CommonUtil.add(total, tx.value).toString();
                depositTx.total = ETHUtil.fromWei(total);
                depositTx.txs.push(tx.hash);
            }
        }
        sails.log.info('[ETHUtil.pickTxForDeposit] return  depositTx:' + JSON.stringify(depositTx));
        return resolve(depositTx);
    })
}
ETHUtil.listTxByAddress = (address, startBlock) => {
    sails.log.info('[ETHUtil.getCurrentBlock] start address: ' + address + ' startBloack:' + startBlock);
    return new Promise((resolve, reject) => {
        if (address == null) {
            return reject('address_null_error');
        }
        if (startBlock == null) {
            return reject('startBlock_null_error');
        }
        const lstTxURI = sails.config.globals.ether_scan_txlist
            + '&address=' + address
            + '&startblock=' + (parseInt(startBlock) + 1)
            + '&endblock=9999999999&sort=desc&apikey=' + sails.config.globals.ether_scan_apikey;
        sails.log.info('[ETHUtil.listTxByAddress] lstTxURI : ' + lstTxURI);
        const lstInternalTxURI = sails.config.globals.ether_scan_txlistinternal
            + '&address=' + address
            + '&startblock=' + (parseInt(startBlock) + 1)
            + '&endblock=9999999999&sort=desc&apikey=' + sails.config.globals.ether_scan_apikey;
        sails.log.info('[ETHUtil.listTxByAddress] lstInternalTxURI : ' + lstInternalTxURI);
        try {
            Promise.all([JsonRPCUtil.Get(lstTxURI), JsonRPCUtil.Get(lstInternalTxURI)]).then((results) => {
                let listtxResp;
                if (typeof results[0] == 'string') {
                    listtxResp = JSON.parse(results[0]);
                } else if (typeof resp == 'object') {
                    listtxResp = results[0]
                }

                let listInternaltxResp;
                if (typeof results[1] == 'string') {
                    listInternaltxResp = JSON.parse(results[1]);
                } else if (typeof resp == 'object') {
                    listInternaltxResp = results[1]
                }

                if (Array.isArray(listtxResp.result) && Array.isArray(listInternaltxResp.result)) {
                    resolve(listtxResp.result.concat(listInternaltxResp.result))
                } else {
                    resolve(listtxResp.result);
                }
            });
        } catch (error) {
            sails.log.error(error);
        }
    });
}

ETHUtil.getCurrentBlock = () => {
    sails.log.info('[ETHUtil.getCurrentBlock] start');
    return web3.eth.getBlockNumber();
}

ETHUtil.validateaddress = (address) => {
    sails.log.info('[ETHUtil.validateaddress] start: address ' + address);
    return new Promise((resolve, reject) => {
        try {
            resolve(web3.utils.isAddress(address));
        } catch (error) {
            resolve(false);
        }
    })
}

ETHUtil.getTransactionCount = (address) => {
    sails.log.info('[ETHUtil.getTransactionCount] start: address ' + address);
    return web3.eth.getTransactionCount(address);
}

ETHUtil.createRawTransaction = function (from, to, pk, gasPrice, amount, txCount) {
    sails.log.info('[ETHUtil.createRawTransaction] start: from ' + from + ' to:' + to + ' pk:***  gasPrice:' + gasPrice + ' amount:' + amount);
    return new Promise((resolve, reject) => {
        if (!from) {
            reject("from_address_not_existed")
        }

        if (!to) {
            reject("to_address_not_existed")
        }

        if (!pk) {
            reject("pk_address_not_existed")
        }

        if (!gasPrice) {
            reject("gasPrice_address_not_existed")
        }

        if (!amount) {
            reject("amount_address_not_existed")
        }

        if (typeof txCount !== 'number') {
            reject("txCount_error")
        }
        try {
            const pkbuf = new Buffer(pk, 'hex');
            const rawTx = {
                nonce: web3.utils.toHex(txCount),
                gasLimit: web3.utils.toHex(gasLimit),
                gasPrice: web3.utils.toHex(parseInt(CommonUtil.multiply(parseInt(gasPrice), 1e9))),
                to: to,
                from: from,
                value: parseInt(CommonUtil.multiply(amount, 1e18))
            };
            const tx = new Tx(rawTx);
            tx.sign(pkbuf);
            const serializedTx = tx.serialize();
            const transactionData = '0x' + serializedTx.toString('hex');
            resolve(transactionData);
        } catch (error) {
            sails.log.error(error);
        }
    });
}

ETHUtil.getTransactionCount = function (from) {
    return web3.eth.getTransactionCount(from);
}

ETHUtil.sendTransaction = function (transactionData) {
    sails.log.info("[ETHUtil.sendTransaction] start: transactionData " + transactionData);
    return new Promise((resolve, reject) => {
        try {
            web3.eth.sendSignedTransaction(transactionData, function (err, hash) {
                if (err) {
                    reject(err);
                } else {
                    sails.log.info("[ETHUtil.sendTransaction] end: response hash" + hash);
                    resolve(hash);
                }
            });
        } catch (error) {
            sails.log.error(error);
        }
    });
}

ETHUtil.getAddressFromPk = function (pk) {
    sails.log.info("[ETHUtil.getAddressFromPk] start: PK ***");
    return web3.eth.accounts.privateKeyToAccount("0x" + pk).address;
}
ETHUtil.getBalanceWei = function (address) {
    sails.log.info("[ETHUtil.getBalance] start: address " + address);
    return new Promise((resolve, reject) => {
        try {
            web3.eth.getBalance(address).then((balance) => {
                resolve(balance)
            });
        } catch (error) {
            sails.log.error(error);
        }
    });
}
ETHUtil.fromWei = function (balance) {
    sails.log.info("[ETHUtil.fromWei] start: balance " + balance);
    return web3.utils.fromWei(balance);
}

ETHUtil.toWei = function (balance) {
    sails.log.info("[ETHUtil.toWei] start: balance " + balance);
    return web3.utils.toWei(balance);
}
ETHUtil.getBalance = function (address) {
    sails.log.info("[ETHUtil.getBalance] start: address " + address);
    return new Promise((resolve, reject) => {
        try {
            web3.eth.getBalance(address).then((balance) => {
                console.log('[web3.utils.fromWei(balance)]',web3.utils.fromWei(balance))
                resolve(web3.utils.fromWei(balance))
            });
        } catch (error) {
            sails.log.error(error);
        }
    });
}

ETHUtil.getReceiveGasPriceByGwei = function () {
    sails.log.info("[ETHUtil.getReceiveGasPriceByGwei] start");
    return String(CommonUtil.divide(CommonUtil.multiply(sails.config.ETH.receiveTransferFee, 1e9), sails.config.globals.eth_transfer_gasLimit));
}

ETHUtil.getSendGasPriceByGwei = function () {
    sails.log.info("[ETHUtil.getSendGasPriceByGwei] start");
    return String(CommonUtil.divide(CommonUtil.multiply(sails.config.ETH.sendTransferFee, 1e9), sails.config.globals.eth_transfer_gasLimit));
}

ETHUtil.saveAssetHistoryToRedis = function (field, flag) {
    const Deposit2TotalHashkey = sails.config.redis.eth_to_total_redis_hashkey + "_" + CommonUtil.getNowFormatDate();
    sails.log.info("[ETHUtil.saveAssetHistoryToRedis]: start: hashkey" + Deposit2TotalHashkey + " field " + field + " true or false flag: " + flag);
    return RedisUtil.hset(Deposit2TotalHashkey, field, flag);
}

ETHUtil.getTransactionReceipt = function (hash) {
    sails.log.info("[ETHUtil.getTransactionReceipt] start: hash " + hash);
    return web3.eth.getTransactionReceipt(hash);
}


ETHUtil.transferBatch = function (from, to, pk, gasPrice, amount, txCount) {
    sails.log.info("[ETHUtil.transferBatch] start: from " + from + ' to: ' + to + ' pk : *** gasPrice: ' + gasPrice + ' amount: ' + amount);
    return new Promise((resolve, reject) => {
        ETHUtil.createRawTransaction(from, to, pk, gasPrice, amount, txCount).then((rawTransactionData) => {
            ETHUtil.sendTransaction(rawTransactionData).then((hash) => {
                sails.log.info("[ETHUtil.transfer] end : response : " + hash);
                resolve(hash);
            }).catch((exception) => { reject(exception) });
        }).catch((exception) => { reject(exception) });
    });
}

ETHUtil.transfer = function (from, to, pk, gasPrice, amount) {
    sails.log.info("[ETHUtil.transfer] start: from " + from + ' to: ' + to + ' pk : *** gasPrice: ' + gasPrice + ' amount: ' + amount);
    return new Promise((resolve, reject) => {
        ETHUtil.getTransactionCount(from).then((txCount) => {
            ETHUtil.createRawTransaction(from, to, pk, gasPrice, amount, txCount).then((rawTransactionData) => {
                ETHUtil.sendTransaction(rawTransactionData).then((hash) => {
                    sails.log.info("[ETHUtil.transfer] end : response : " + hash);
                    resolve(hash);
                }).catch((exception) => { reject(exception) });
            }).catch((exception) => { reject(exception) });
        });
    });
}
module.exports = ETHUtil