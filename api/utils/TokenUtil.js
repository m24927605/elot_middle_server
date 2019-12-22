
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(sails.config.globals.web3_http_provider));
const fs = require('fs');
const erc20Path = require('path').resolve(sails.config.appPath, sails.config.globals.erc20Interface_json);
const erc20ABI = JSON.parse(fs.readFileSync(erc20Path, 'utf8')).abi;
const Tx = require('ethereumjs-tx');
const RedisUtil = require('../utils/RedisUtil');
const CommonUtil = require('../utils/CommonUtil');
const JsonRPCUtil = require('../utils/JsonRPCUtil');
const ETHUtil = require('../utils/ETHUtil');
const TokenUtil = () => { };
TokenUtil.pickTxForDeposit = (txs, address, tokenName) => {
    sails.log.info('[TokenUtil.pickTxForDeposit] start  txs:' + JSON.stringify(txs) + ' address: ' + address + ' tokenName:' + tokenName);
    return new Promise((resolve, reject) => {
        if (!Array.isArray(txs)) {
            return reject('txs_not_array');
        }
        try {
            const depositTx = {};
            let total = 0;
            for (let index = 0; index < txs.length; index++) {
                const tx = txs[index];
                if (index === 0) {
                    depositTx.blockNumber = tx.blockNumber;
                    depositTx.txs = [];
                }
                if (tx.to === address && tx.tokenSymbol == tokenName) {
                    total = CommonUtil.add(total, tx.value).toString();
                    depositTx.total = total;
                    depositTx.txs.push(tx.hash);
                }
            }
            sails.log.info('[TokenUtil.pickTxForDeposit] return  depositTx:' + JSON.stringify(depositTx));
            return resolve(depositTx);
        } catch (error) {
            sails.log.error(error);
        }

    })
}
TokenUtil.listTxByAddress = (address, startBlock) => {
    sails.log.info('[TokenUtil.getCurrentBlock] start address: ' + address + ' startBloack:' + startBlock);
    return new Promise((resolve, reject) => {
        if (address == null) {
            return reject('address_null_error');
        }
        if (startBlock == null) {
            return reject('startBlock_null_error');
        }
        const lstTxURI = sails.config.globals.ether_scan_tokentx
            + '&address=' + address
            + '&startblock=' + (parseInt(startBlock) + 1)
            + '&endblock=9999999999&sort=desc&apikey=' + sails.config.globals.ether_scan_apikey;
        sails.log.info('[TokenUtil.getCurrentBlock]  lstTxURI:' + lstTxURI);
        try {
            JsonRPCUtil.Get(lstTxURI).then(resp => {
                let txResp;
                if (typeof resp == 'string') {
                    txResp = JSON.parse(resp);
                } else if (typeof resp == 'object') {
                    txResp = resp
                }
                sails.log.info('[TokenUtil.getCurrentBlock]  txResp.result:' + txResp.result);
                return resolve(txResp.result)
            })
        } catch (error) {
            sails.log.error(error);
        }
    });
}
TokenUtil.processFeeApply = function (address, userid, assetname) {
    return new Promise(async (resolve, reject) => {
        sails.log.info('[TokenUtil.processFeeApply] start : address ' + address + ' userid ' + userid + ' assetname ' + assetname);
        try {
            const flag = await TokenUtil.getTokenFeeApplyInRedis(address);
            if (!flag || String(flag).toUpperCase() === String(sails.config.constant.false).toUpperCase()) {
                let gasTankerObject = {};
                gasTankerObject.timestamp = new Date().getTime();
                gasTankerObject.userid = userid;
                gasTankerObject.assetname = assetname;
                gasTankerObject.address = address;
                gasTankerObject.size = sails.config[String(assetname).toUpperCase()].sendTransferFee;
                await WalletGasTankerService.addGasTankerMQ(gasTankerObject);
                await TokenUtil.addTokenFeeApplyInRedis(address, true);
                resolve(true);
            } else {
                resolve(flag);
            }
        } catch (error) {
            sails.log.error(error);
        }
    });
}
TokenUtil.addTokenFeeApplyInRedis = function (address, flag) {
    sails.log.info('[TokenUtil.addTokenFeeApplyInRedis] start : address ' + address);
    return new Promise((resolve, reject) => {
        if (address == null || address == undefined || address == "undefined" || address == "null") {
            return reject({ err: 'address_null' });
        }
        RedisUtil.hset(sails.config.redis.token_fee_apply_hashkey, address, flag).then((resp) => {
            resolve(resp);
        });
    });
}
TokenUtil.getTokenFeeApplyInRedis = function (address) {
    sails.log.info('[TokenUtil.getTokenFeeApplyInRedis] start : address ' + address);
    return new Promise((resolve, reject) => {
        try {
            if (address == null || address == undefined || address == "undefined" || address == "null") {
                return reject({ err: 'address_null' });
            }
            RedisUtil.hget(sails.config.redis.token_fee_apply_hashkey, address).then((flag) => {
                resolve(flag);
            });
        } catch (error) {
            sails.log.error(error);
        }
    });
}
TokenUtil.getCurrentBlock = function () {
    sails.log.info('[TokenUtil.getCurrentBlock]: start');
    return web3.eth.getBlockNumber();
}

TokenUtil.validateaddress = function (address) {
    sails.log.info('[TokenUtil.validateaddress]: start address : ' + address);
    return new Promise((resolve, reject) => {
        resolve(web3.utils.isAddress(address));
    })
}

TokenUtil.getAddressFromPk = function (pk) {
    sails.log.info('[TokenUtil.getAddressFromPk]: start pk : **** ');
    return web3.eth.accounts.privateKeyToAccount("0x" + pk).address;
}

TokenUtil.getTransactionCount = function (address) {
    sails.log.info('[TokenUtil.getTransactionCount]: start address ' + address);
    return web3.eth.getTransactionCount(address);
}

TokenUtil.getTransactionReceipt = function (hash) {
    sails.log.info('[TokenUtil.getTransactionReceipt]: start hash ' + hash);
    return web3.eth.getTransactionReceipt(hash);
}

TokenUtil.createRawTransaction = function (from, to, pk, gasPrice, amount, contractaddress, txCount) {
    sails.log.info('[TokenUtil.createRawTransaction]: start from: ' + from + ' to: ' + to + ' pk: ' + pk + 'gasPrice:' + gasPrice + ' amount:' + amount + ' txcount: ' + txCount + ' contractaddress:' + contractaddress);
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
        if (!contractaddress) {
            reject("contractaddress_address_not_existed")
        }

        if (typeof txCount !== 'number') {
            reject("txCount_error")
        }

        try {
            let pkbuf = new Buffer(pk, 'hex');
            var contract = new web3.eth.Contract(erc20ABI, contractaddress);
            var dataobj = contract.methods.transfer(to, amount).encodeABI();
            // web3.eth.getTransactionCount(from).then((txCount) =>{ 
            var rawTx = {
                nonce: web3.utils.toHex(txCount),
                gasLimit: web3.utils.toHex(sails.config.globals.token_transfer_gasLimit),
                gasPrice: web3.utils.toHex(parseInt(CommonUtil.multiply(gasPrice, 1e9))),
                to: contractaddress,
                from: from,
                data: dataobj
            };
            var tx = new Tx(rawTx);
            tx.sign(pkbuf);
            var serializedTx = tx.serialize();
            var transactionData = '0x' + serializedTx.toString('hex');
            resolve(transactionData);
        } catch (error) {
            sails.log.error(error);
        }
    });
}

TokenUtil.transfer = function (from, to, pk, gasPrice, amount, contractaddress) {
    sails.log.info('[TokenUtil.transfer]: start from: ' + from + ' to: ' + to + 'pk: **** gasPrice:' + gasPrice + ' amount:' + amount + ' contractaddress:' + contractaddress);
    return new Promise((resolve, reject) => {
        TokenUtil.getTransactionCount(from).then((txcount) => {
            TokenUtil.createRawTransaction(from, to, pk, gasPrice, amount, contractaddress, txcount).then((rawTransactionData) => {
                ETHUtil.sendTransaction(rawTransactionData).then((hash) => {
                    resolve(hash);
                }).catch((exception) => { reject(exception) });
            }).catch((exception) => { reject(exception) });
        });
    });
}
TokenUtil.transferBatch = function (from, to, pk, gasPrice, amount, contractaddress, txcount) {
    sails.log.info('[TokenUtil.transfer]: start from: ' + from + ' to: ' + to + 'pk: **** gasPrice:' + gasPrice + ' amount:' + amount + ' contractaddress:' + contractaddress);
    return new Promise((resolve, reject) => {
        TokenUtil.createRawTransaction(from, to, pk, gasPrice, amount, contractaddress, txcount).then((rawTransactionData) => {
            ETHUtil.sendTransaction(rawTransactionData).then((hash) => {
                resolve(hash);
            }).catch((exception) => { reject(exception) });
        }).catch((exception) => { reject(exception) });
    });
}

TokenUtil.setDepositHash2Redis = function (tokenName, field, flag) {
    sails.log.info("[ETHUtil.setDepositHash2Redis] start:  field " + field + " true or false flag: " + flag + " token name" + tokenName);
    var Deposit2TotalHashkey = tokenName + "_" + sails.config.redis.token_to_total_redis_hashkey + "_" + CommonUtil.getNowFormatDate();
    return RedisUtil.hset(Deposit2TotalHashkey, field, flag);
}
TokenUtil.getReceiveGasPriceByGwei = function (transferfee) {
    sails.log.info('[TokenUtil.getReceiveGasPriceByGwei]: start');
    return parseFloat(CommonUtil.divide(CommonUtil.multiply(transferfee, 1e9), sails.config.globals.token_transfer_gasLimit));
}
TokenUtil.getSendGasPriceByGwei = function (transferfee) {
    sails.log.info('[TokenUtil.getSendGasPriceByGwei]: start');
    return parseFloat(CommonUtil.divide(CommonUtil.multiply(transferfee, 1e9), sails.config.globals.token_transfer_gasLimit));
}
TokenUtil.getGasTankerGasPriceByGwei = function () {
    sails.log.info('[TokenUtil.getGasTankerGasPriceByGwei]: start');
    return parseFloat(CommonUtil.divide(CommonUtil.multiply(sails.config.globals.gas_tanker_transferfee, 1e9), sails.config.globals.token_transfer_gasLimit));
}
TokenUtil.getBalance = function (address, contractAddress) {
    sails.log.info('[TokenUtil.getBalance]: start address ' + address + ' contractAddress:' + contractAddress);
    var contract = new web3.eth.Contract(erc20ABI, contractAddress);
    return contract.methods.balanceOf(address).call();
}
TokenUtil.transferWithBalanceCheck = function (to, pk, gasPrice, amount, tokenName) {
    sails.log.info('[WalletSendService.transferWithBalanceCheck] start: to ' + to + ' pk:' + pk + ' gasPrice: ' + gasPrice + ' amount: ' + amount + ' tokenName: ' + tokenName);
    return new Promise((resolve, reject) => {
        const decimal = sails.config[String(tokenName).toUpperCase()].decimal;
        const contractAddress = sails.config[String(tokenName).toUpperCase()].contract;
        const amountWithDecimalChange = CommonUtil.multiply(amount, decimal).toString();
        TokenUtil.getBalance(ETHUtil.getAddressFromPk(pk), contractAddress).then((balance) => {
            if (parseInt(balance) < parseInt(amountWithDecimalChange)) {
                reject({ error: "balance_not_enough", balance: CommonUtil.divide(balance, decimal).toString(), amount: amount });
            } else {
                TokenUtil.transfer(ETHUtil.getAddressFromPk(pk), to, pk, gasPrice, amountWithDecimalChange, contractAddress).then((txid) => {
                    resolve(txid);
                }).catch((exception) => {
                    reject(exception);
                });
            }
        });
    });
}

TokenUtil.transferWithTxCount = function (to, pk, gasPrice, amount, tokenName, txCount) {
    sails.log.info('[WalletSendService.transferWithBalanceCheck] start: to ' + to + ' pk:' + pk + ' gasPrice: ' + gasPrice + ' amount: ' + amount + ' tokenName: ' + tokenName + ' txCount: ' + txCount);
    return new Promise((resolve, reject) => {
        const decimal = sails.config[String(tokenName).toUpperCase()].decimal;
        const contractAddress = sails.config[String(tokenName).toUpperCase()].contract;
        const amountWithDecimalChange = CommonUtil.multiply(amount, decimal).toString();
        TokenUtil.getBalance(ETHUtil.getAddressFromPk(pk), contractAddress).then((balance) => {
            if (parseInt(balance) < parseInt(amountWithDecimalChange)) {
                reject({ error: "balance_not_enough", balance: CommonUtil.divide(balance, decimal).toString(), amount: amount });
            } else {
                TokenUtil.transferBatch(ETHUtil.getAddressFromPk(pk), to, pk, gasPrice, amountWithDecimalChange, contractAddress, txCount).then((txid) => {
                    resolve(txid);
                }).catch((exception) => {
                    reject(exception);
                });
            }
        });
    });
}
module.exports = TokenUtil;


