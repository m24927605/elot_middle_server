/**
* 交易所调用API的工具包
*/


var crypto = require("crypto")

var Util = function () { }
Util.isNull = function (str) {
    if (str == "" || str == null) return
    var regu = "^[ ]+$"
    var re = new RegExp(regu)
    return re.test(re)
}

/**
*生成指定位数字符串
*/
Util.generateNonceString = function (length) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var maxPos = chars.length;
    var noceStr = "";
    for (var i = 0; i < (length || 32); i++) {
        noceStr += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return noceStr;
};

//AES加密
Util.encryptByAES = function (content, secretkey, format) {
    if (!format) {
        format = 'hex';
    }

    const cipher = crypto.createCipher('aes-128-ecb', secretkey);
    var cipherResult = cipher.update(content, 'utf8', format);
    cipherResult += cipher.final(format);
    return cipherResult
}

//AES解密
Util.decryByAES = function (deContent, secretkey, format) {
    if (!format) {
        format = 'hex';
    }
    var decipher = crypto.createDecipher('aes-128-ecb', secretkey);
    var decrypted = decipher.update(deContent, format, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted
}

//生成secretkey
Util.generateSecretKey = function (length) {
    return Util.generateNonceString(length)
}

//生成apikey
Util.generateApiKey = function (userid, timestamp, passphrase, secretKey) {
    var s = userid + '_' + timestamp + '_' + passphrase;
    var base64Str = Util.encodeBase64(s);
    var apikey = Util.encryptByAES(base64Str, secretKey);
    return apikey
}
//base64加密
Util.encodeBase64 = function (s) {
    var base64Str = new Buffer(s).toString('base64');
    return base64Str
}
//base64解密
Util.decodeBase64 = function (x) {
    var b = new Buffer(x, 'base64').toString()
    return b;
}
//apikey 还原出userid/timestamp
Util.reduceApikey = function (apikey, secretkey) {
    var decode = Util.decryByAES(apikey, secretkey)
    var base64 = Util.decodeBase64(decode)
    var arr = base64.split('_')
    return arr;
}

module.exports = Util