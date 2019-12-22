const LTCUtil = function () { }
const btcapi = require('bitcoinjs-lib');
let CommonUtil = require('../utils/CommonUtil');
let JsonRPCUtil = require('../utils/JsonRPCUtil');
let sochain = sails.config.globals.sochain_ltc;

let currentnet = sails.config.bip.ltc_network;

LTCUtil.publicKeyFromPK = function (pk) {
    var keypair = btcapi.ECPair.fromWIF(pk, currentnet);
    return keypair.publicKey.toString("hex");
}

LTCUtil.addressFromPublicKey = function (publicKey) {
    return btcapi.payments.p2pkh({ pubkey: Buffer.from(publicKey, "hex"), network: currentnet }).address
}

LTCUtil.addressFromPK = function (pk) {
    return LTCUtil.addressFromPublicKey(LTCUtil.publicKeyFromPK(pk));
}



LTCUtil.createRawTransaction = function (unspent, toAddress, amountToSend, pk, fromAddress, transactionFee) {


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

        const tx = new btcapi.TransactionBuilder(currentnet);
        // console.log("######a########,output_no",output_no);
        // console.log("######a########,txid",txid);
        var accountNumber = 0;
        var amountWeHave = 0;
        while (accountNumber < unspent.length) {

            sails.log.info("current unspent", unspent[accountNumber]);

            amountWeHave = amountWeHave + parseInt(CommonUtil.multiply(unspent[accountNumber].value, 100000000));

            tx.addInput(unspent[accountNumber].txid, parseInt(unspent[accountNumber].output_no));

            if (amountWeHave >= amountToSend + transactionFee) {
                break;
            };

            accountNumber++;
        }

        // console.log("###########amountWeHave:#######",amountWeHave);

        // console.log("###########transactionFee:#######",transactionFee);
        var amountToKeep = amountWeHave - amountToSend - transactionFee;

        // console.log("######a########");
        // console.log("######a########,toAddress",toAddress);
        // console.log("######a########,amountToSend",amountToSend);

        tx.addOutput(toAddress, parseInt(amountToSend));

        // console.log("######a########,fromAddress",fromAddress);
        // console.log("######a########,amountToKeep",amountToKeep);

        tx.addOutput(fromAddress, parseInt(amountToKeep));

        //console.log("######a########,pk",pk);
        for (var i = 0; i <= accountNumber; i++) {
            tx.sign(i, btcapi.ECPair.fromWIF(pk, currentnet));
        }


        var rawTransactionData = tx.build().toHex();
        // console.log("rawTransactionData",rawTransactionData);
        resolve(rawTransactionData);
    });



}


LTCUtil.getbalance = function (address) {

    return new Promise((resolve, reject) => {
        JsonRPCUtil.Get(sochain.url + sochain.get_address_balance + sochain.network + address)
            .then((resp) => {
                let data;
                try {
                    data = JSON.parse(resp);
                    if (data.status == 'success') {
                        resolve(data.data.confirmed_balance);
                    } else {
                        reject({ err: 'get_address_balance_error' });
                    }
                } catch (exception) {
                    sails.log.error(exception);
                }



            })
    });
}

LTCUtil.gettransaction = function (txid) {
    return new Promise((resolve, reject) => {
        JsonRPCUtil.Get(sochain.url + sochain.get_tx + sochain.network + txid)
            .then((resp) => {

                let data;

                try {

                    data = JSON.parse(resp);
                    if (data.status == 'success') {
                        resolve(data.data);
                    } else {
                        reject({ err: 'get_tx_error' });
                    }
                } catch (exception) {
                    sails.log.error(exception);
                }



            })
    });
}

LTCUtil.sendrawtransaction = function (rawTransactionData) {
    return new Promise((resolve, reject) => {
        var postdata = { tx_hex: rawTransactionData };
        JsonRPCUtil.PostV2(postdata, sochain.url + sochain.send_tx + sochain.network)
            .then((resp) => {
                if (resp.data && resp.data.txid) {
                    // console.log('resp.data.txid',resp.data.txid);
                    resolve(resp.data.txid);
                } else {
                    reject({ err: 'send_tx_error' });
                }
            })
    });
}

LTCUtil.getrawtransaction = function (txid) {
    return LTCUtil.gettransaction(txid);

}

LTCUtil.listunspent = function (address) {
    return new Promise((resolve, reject) => {
        JsonRPCUtil.Get(sochain.url + sochain.get_tx_unspent + sochain.network + address)
            .then((resp) => {

                let data;

                try {
                    data = JSON.parse(resp);

                    if (data.status == 'success') {
                        resolve(data.data.txs);
                    } else {
                        reject({ err: 'get_tx_unspent_error' });
                    }
                } catch (exception) {
                    sails.log.error(exception);
                }



            })
    });
}

LTCUtil.getCurrentBlock = function () {
    return new Promise((resolve, reject) => {
        JsonRPCUtil.Get(sochain.url + sochain.get_info + sochain.network)
            .then((resp) => {
                let data;
                try {
                    data = JSON.parse(resp);
                    if (data.status == 'success') {
                        resolve(data.data.blocks);
                    } else {
                        reject({ err: 'get_blocks_error' });
                    }
                } catch (exception) {
                    sails.log.error(exception);
                }


            })
    });
}



LTCUtil.validateaddress = function (address) {
    return new Promise((resolve, reject) => {
        JsonRPCUtil.Get(sochain.url + sochain.is_address_valid + sochain.network + address)
            .then((resp) => {
                let data;
                try {
                    console.log('LTCUtil.validateaddress', resp);
                    data = JSON.parse(resp);
                    if (data.status == 'success') {
                        resolve(data.data);
                    } else {
                        reject({ err: 'check_is_address_valid_error' });
                    }
                } catch (exception) {
                    sails.log.error(exception);
                }



            })
    });
}

LTCUtil.transfer = function (toAddress, amountToSend, pk, transactionFee) {
    return new Promise((resolve, reject) => {
        let fromAddress = LTCUtil.addressFromPublicKey(LTCUtil.publicKeyFromPK(pk));
        //列出fromAddress的余额信息

        LTCUtil.listunspent(fromAddress)
            .then((unspent) => {
                sails.log.info("unspent", unspent);
                //txid,vout,amountWeHave,toAddress,amountToSend,pk,fromPublicKey,transactionFee
                LTCUtil.createRawTransaction(
                    unspent,
                    toAddress,
                    parseInt(CommonUtil.multiply(amountToSend, 100000000)),
                    pk,
                    fromAddress,
                    parseInt(CommonUtil.multiply(transactionFee, 100000000))
                )
                    .then((rawTransactionHex) => {
                        //console.log(rawTransactionHex);
                        LTCUtil.sendrawtransaction(rawTransactionHex)
                            .then((txid) => {
                                resolve(txid)
                            })
                            .catch((sendrawtransactionException) => { reject(sendrawtransactionException) });
                    })
                    .catch((createRawTransactionException) => { reject(createRawTransactionException) });


            })
            .catch((listunspentException) => { reject(listunspentException) });
    });
}

module.exports = LTCUtil