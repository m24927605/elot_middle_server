
const btcapi = require('bitcoinjs-lib');
const CommonUtil = require('../utils/CommonUtil');
const JsonRPCUtil = require('../utils/JsonRPCUtil');
const WAValidator = require('wallet-address-validator');

const BTCUtil = () => { };
const bitcore = sails.config.globals.bitcore;
let currentnet;
if (sails.config.globals.btc_current_net == 0) {
    currentnet = btcapi.networks.testnet;
} else if (sails.config.globals.btc_current_net == 1) {
    currentnet = btcapi.networks.bitcoin;
}

BTCUtil.listTxByAddress = (address) => {
    sails.log.info('[BTCUtil.listTxByAddress] start : address ' + address);
    return new Promise((resolve, reject) => {
        try {
            JsonRPCUtil.Get(bitcore.url + bitcore.get_address_balance + address + bitcore.get_tx_unspent)
                .then((resp) => {
                    try {
                        if (resp) {
                            resolve(JSON.parse(resp));
                        } else {
                            reject({ err: sails.config.constant.get_txs_error });
                        }
                    } catch (exception) {
                        sails.log.error(exception);
                        reject(exception);
                    }
                })
        } catch (error) {
            sails.log.error(error);
        }
    });

}

BTCUtil.pickTxForDeposit = (txs) => {
    sails.log.info('[BTCUtil.pickTxForDeposit] start  txs:' + JSON.stringify(txs));
    return new Promise((resolve, reject) => {
        try {
            if (!Array.isArray(txs)) {
                return reject('txs_not_array');
            }
            const depositTx = {};
            let total = 0;
            const filteredTxs = txs.filter((txs) => {
                return txs.confirmations > 0;
            })
            for (let index = 0; index < filteredTxs.length; index++) {
                const tx = filteredTxs[index];
                if (index === 0) {
                    depositTx.blockNumber = tx.height;
                    depositTx.txs = [];
                }
                total = CommonUtil.add(total, tx.amount).toString();
                depositTx.txs.push(tx.txid);
            }
            depositTx.total = total;
            return resolve(depositTx);
        } catch (error) {
            sails.log.error(error);
        }
    })

}

BTCUtil.publicKeyFromPK = (pk) => {
    sails.log.info('[BTCUtil.publicKeyFromPK] start : pk : ****');
    let keypair;
    try {
        keypair = btcapi.ECPair.fromWIF(pk, currentnet);
    } catch (exception) {
        sails.log.error(exception);
    }
    return keypair.publicKey.toString("hex");
}

BTCUtil.addressFromPublicKey = (publicKey) => {
    sails.log.info('[BTCUtil.addressFromPublicKey] start : publicKey : ' + publicKey);
    return btcapi.payments.p2pkh({ pubkey: Buffer.from(publicKey, "hex"), network: currentnet }).address
}

BTCUtil.addressFromPK = (pk) => {
    sails.log.info('[BTCUtil.addressFromPK] start : pk **** ');
    return BTCUtil.addressFromPublicKey(BTCUtil.publicKeyFromPK(pk));
}

BTCUtil.createRawTransaction = (unspent, toAddress, amountToSend, pk, fromAddress, transactionFee) => {
    sails.log.info('[BTCUtil.createRawTransaction] start : currentnet ' + JSON.stringify(currentnet));
    return new Promise((resolve, reject) => {
        if (!unspent) {
            reject("unspent_not_existed");
        }

        if (toAddress == null || toAddress == undefined) {
            reject("toAddress_not_existed");
        }

        if (amountToSend == null || amountToSend == undefined) {
            reject("amountToSend_not_existed");
        }

        if (pk == null || pk == undefined) {
            reject("pk_not_existed");
        }

        if (fromAddress == null || fromAddress == undefined) {
            reject("fromAddress_not_existed");
        }

        if (transactionFee == null || transactionFee == undefined) {
            reject("transactionFee_not_existed");
        }

        try {
            const tx = new btcapi.TransactionBuilder(currentnet);
            let accountNumber = 0;
            let amountWeHave = 0;
            while (accountNumber < unspent.length) {
                amountWeHave = amountWeHave + unspent[accountNumber].satoshis;
                tx.addInput(unspent[accountNumber].txid, parseInt(unspent[accountNumber].vout));
                if (amountWeHave >= amountToSend + transactionFee) {
                    break;
                };
                accountNumber++;
            }

            let amountToKeep = amountWeHave - amountToSend - transactionFee;
            tx.addOutput(toAddress, parseInt(amountToSend));
            tx.addOutput(fromAddress, parseInt(amountToKeep));
            sails.log.info('[BTCUtil.createRawTransaction] detail : amountWeHave ' + amountWeHave + ' transactionFee: ' + transactionFee + ' toAddress: ' + toAddress + ' amountToSend: ' + amountToSend + ' fromAddress:' + fromAddress + ' amountToKeep:' + amountToKeep);

            for (let i = 0; i <= accountNumber; i++) {
                tx.sign(i, btcapi.ECPair.fromWIF(pk, currentnet));
            }

            const rawTransactionData = tx.build().toHex();
            sails.log.info('[BTCUtil.createRawTransaction] end  ');
            resolve(rawTransactionData);

        } catch (exception) {
            sails.log.error(exception);
            reject(exception);
        }

    });
}


BTCUtil.getbalance = function (address) {
    sails.log.info('[BTCUtil.getbalance] start : address ' + address);
    return new Promise((resolve, reject) => {
        try {
            console.log('[bitcore.url + bitcore.get_address_balance + address]',bitcore.url + bitcore.get_address_balance + address)
            JsonRPCUtil.Get(bitcore.url + bitcore.get_address_balance + address).then((resp) => {
                try {
                    console.log('[resp]',resp)
                    let data = JSON.parse(resp);
                    if (data) {
                        resolve(data.balance);
                    } else {
                        reject({ err: sails.config.constant.get_address_balance_error });
                    }
                } catch (exception) {
                    sails.log.error(exception);
                    reject(exception);
                }
            })
        } catch (error) {
            sails.log.error(error);
        }
    });
}

BTCUtil.gettransaction = function (txid) {
    sails.log.info('[BTCUtil.gettransaction] start : txid ' + txid);
    return new Promise((resolve, reject) => {
        try {
            JsonRPCUtil.Get(bitcore.url + bitcore.get_tx + txid)
                .then((resp) => {
                    let data = JSON.parse(resp);
                    try {
                        if (data.txid) {
                            resolve(data);
                        } else {
                            reject({ err: 'get_tx_error' });
                        }
                    } catch (exception) {
                        sails.log.error(exception);
                    }
                })
        } catch (error) {
            sails.log.error(error);
        }
    });
}

BTCUtil.sendrawtransaction = function (rawTransactionData) {
    sails.log.info('[BTCUtil.sendrawtransaction] start : rawTransactionData ' + rawTransactionData);
    return new Promise((resolve, reject) => {
        const postdata = { rawtx: rawTransactionData };
        try {
            JsonRPCUtil.PostV2(postdata, bitcore.url + bitcore.send_tx).then((resp) => {
                if (resp.txid) {
                    sails.log.info('[BTCUtil.sendrawtransaction] end : txid ' + resp.txid);
                    resolve(resp.txid);
                } else {
                    reject({ err: 'send_tx_error' });
                }
            })
        } catch (error) {
            sails.log.error(error);
        }
    });
}

BTCUtil.getrawtransaction = function (txid) {
    sails.log.info('[BTCUtil.getrawtransaction] start : txid ' + txid);
    return BTCUtil.gettransaction(txid);
}
BTCUtil.checkUnspent = function (unspents, size) {
    sails.log.info('[BTCUtil.checkUnspent] start : unspents ' + unspents + ' size: ' + size);
    if (!unspents && unspents.length <= 0) {
        return false;
    }
    let amount = 0;
    for (let index = 0; index < unspents.length; index++) {
        const unspent = unspents[index];
        amount = amount + unspent.amount;
    }
    if (amount >= size) {
        return true;
    } else {
        return false;
    }
}

BTCUtil.listunspent = function (address) {
    sails.log.info('[BTCUtil.listunspent] start : address ', address);
    return new Promise((resolve, reject) => {
        try {
            JsonRPCUtil.Get(bitcore.url + bitcore.is_address_valid + address + bitcore.get_tx_unspent)
                .then((resp) => {
                    let data = JSON.parse(resp);
                    try {
                        if (data && data.length > 0) {
                            resolve(data);
                        } else {
                            reject({ err: 'get_tx_unspent_error' });
                        }
                    } catch (exception) {
                        reject(exception);
                    }
                });
        } catch (error) {
            sails.log.error(error);
        }
    });
}

BTCUtil.getCurrentBlock = function () {
    sails.log.info('[BTCUtil.getCurrentBlock] start');
    return new Promise((resolve, reject) => {
        try {
            JsonRPCUtil.Get(bitcore.url + bitcore.get_info)
                .then((resp) => {
                    let data = JSON.parse(resp);
                    try {
                        if (data && data.info) {
                            sails.log.info('[BTCUtil.getCurrentBlock] end : response :' + data.info.blocks);
                            resolve(data.info.blocks);
                        } else {
                            reject({ err: 'get_blocks_error' });
                        }
                    } catch (exception) {
                        resolve(0);
                    }
                })
        } catch (error) {
            sails.log.error(error);
        }
    });
}

BTCUtil.validateaddress = function (address) {
    sails.log.info('[BTCUtil.validateaddress] start address: ' + address);
    return new Promise((resolve, reject) => {
        try {
            const valid = WAValidator.validate(address, sails.config.asset.assets_btc_name, 'both');
            resolve(valid);
        } catch (error) {
            reject(error);
        }
    });
}

BTCUtil.transfer = function (toAddress, amountToSend, pk, transactionFee) {
    sails.log.info('[BTCUtil.transfer] start : toAddress:' + toAddress + ' amountToSend:' + amountToSend + ' pk:***' + ' transactionFee:' + transactionFee);
    return new Promise((resolve, reject) => {
        let fromAddress = BTCUtil.addressFromPublicKey(BTCUtil.publicKeyFromPK(pk));
        BTCUtil.listunspent(fromAddress).then((unspent) => {
            BTCUtil.createRawTransaction(unspent, toAddress, parseInt(CommonUtil.multiply(amountToSend, 100000000)), pk, fromAddress, parseInt(CommonUtil.multiply(transactionFee, 100000000)))
                .then((rawTransactionHex) => {
                    BTCUtil.sendrawtransaction(rawTransactionHex).then((txid) => {
                        sails.log.info('[BTCUtil.transfer] start : txid ' + txid);
                        resolve(txid)
                    }).catch((sendrawtransactionException) => { reject(sendrawtransactionException) });
                }).catch((createRawTransactionException) => { reject(createRawTransactionException) });
        }).catch((listunspentException) => { reject(listunspentException) });
    });
}

module.exports = BTCUtil