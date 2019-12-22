let JsonRPCUtil = require('../utils/JsonRPCUtil');
const Decimal = require('decimal.js');
const QRCode = require('qrcode');
const scheduler = require('node-schedule');
const CryptoJS = require("crypto-js");
const binance = require('node-binance-api')().options({
    APIKEY: 'uqHUgTfS7fsNTKLxCJp70OGhe7tjFg9KCzfpC4oCySZTQYGOgmB3liJH72WabFQc',
    APISECRET: 'SfqRZcfj1UpJqRTSl6NrZHXsXegu3rdRhZD092wLYUSvJcOmcam3xbeHrwtu1VM0',
    useServerTime: true
  });

const CommonUtil = () => { };

CommonUtil.getPrices = () =>new Promise((resolve, reject)=>{
    binance.prices((error, ticker) => {
        if(error){
            return reject(error);
        } else {
            return resolve(ticker);
        }
    });;
});

CommonUtil.validateEmail = (email) => {
    sails.log.info('[CommonUtil.validateEmail] start  email: ' + email);
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

CommonUtil.trimDecimal = (decimal, length) => {
    sails.log.info('[CommonUtil.trimDecimal] start  decimal: ' + decimal + ' length: ' + length);
    return String(decimal).substring(0, String(decimal).indexOf(".") + length + 1)
}

CommonUtil.formatDecimal = (decimal) => {
    return new Decimal(decimal).toString();
}

CommonUtil.checkDecimal = (market, price, amount) => {
    sails.log.info('[CommonUtil.checkDecimal] start  market: ' + market + ' price: ' + price + ' amount: ' + amount);
    const decimalDef = sails.config.trader.market_param[market];

    if (!decimalDef || !decimalDef.asset || !decimalDef.money) {
        return false;
    }

    if (decimalDef[decimalDef.asset] < CommonUtil.decimalLength(amount)) {
        return false;
    }
    if (decimalDef[decimalDef.money] < CommonUtil.decimalLength(price)) {
        return false;
    }
    return true;
}

CommonUtil.decimalLength = (amount) => {
    sails.log.info('[CommonUtil.decimalLength] start  amount: ' + amount);
    if (String(amount).indexOf(".") === -1) {
        return 0;
    } else {
        return amount.toString().split(".")[1].length;
    }
}

CommonUtil.getTicker = () => {
    return new Promise(resolve => {
        JsonRPCUtil.Get(sails.config.trader.global_price)
            .then((ticker) => {
                resolve(ticker);
            })
    })
}

CommonUtil.sleep = (ms) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

CommonUtil.add = (x, y) => {
    return Decimal.add(x, y);
}

CommonUtil.subtract = (x, y) => {
    return Decimal.sub(x, y);
}

CommonUtil.multiply = (x, y) => {
    return Decimal.mul(x, y);
}

CommonUtil.divide = (x, y) => {
    return Decimal.div(x, y);
}

CommonUtil.encrypt = (data, password) => {
    return new Promise((resolve, reject) => {
        let encryptedkeystore;
        try {
            encryptedkeystore = CryptoJS.AES.encrypt(data, password);
        } catch (exception) {
            reject(exception);
            sails.log.error(exception);
        }
        resolve(encryptedkeystore);
    })
}

CommonUtil.decrypt = (data, password) => {
    return new Promise((resolve, reject) => {
        let keyStore;
        try {
            const bytes = CryptoJS.AES.decrypt(data, password);
            keyStore = bytes.toString(CryptoJS.enc.Utf8);
        } catch (exception) {
            sails.log.error("Maybe Password is wrong: exception:", exception);
            reject(exception);
        }
        resolve(keyStore);
    })
}

/**
 * 为各种数据生成base64的二维码，并且返回
 */
CommonUtil.qrcode = (data) => {
    sails.log.info("CommonUtil.qrcode : data " + data);
    return new Promise((resolve, reject) => {
        QRCode.toDataURL(data, function (err, url) {
            resolve(url);
        });
    });
}

CommonUtil.scheduler = (cron, callback, callbackname) => {
    sails.log.info("CommonUtil.scheduler " + cron + ": callback  " + callbackname);
    scheduler.scheduleJob(cron, callback);
}

CommonUtil.isJSON = (str) => {
    //sails.log.info("CommonUtil.isJSON str: "+str );
    if (typeof str == 'string') {
        try {
            const obj = JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }
}

//获取当前时间，格式YYYY-MM-DD
CommonUtil.getNowFormatDate = () => {
    sails.log.info("CommonUtil.getNowFormatDate ");
    const date = new Date();
    const seperator1 = "-";
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    const currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate;
}

//获取昨天时间，格式YYYY-MM-DD
CommonUtil.getYesterdayFormatDate = () => {
    sails.log.info("CommonUtil.getYesterdayFormatDate ");
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const seperator1 = "-";
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    const yesterday = year + seperator1 + month + seperator1 + strDate;
    return yesterday;
}
module.exports = CommonUtil