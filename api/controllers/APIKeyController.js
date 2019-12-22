/**
 * APIKeyController
 *这个对象是外来访问API的接口，与EntryPoint对象一起使用
 *用户通过这个API创建API key和Secrete key两个对象
 */
var Util = require("../utils/APIUtil")

var createOrUpdateAPIKey = function (req, res) {
    var body = req.body;
    sails.log.info("createOrUpdateApikey_denug:", req.ip)
    sails.log.error("createOrUpdateApikey_error:", req.ip)


    if (!body.userid || !body.passphrase) {
        res.json(400, { err: "userid or passphrase is null" })
        return
    }
    console.log("generate_api_body:", body, req.params.id)
    var timestamp = new Date().getTime()
    var secretkey = Util.generateSecretKey()
    var apikey = Util.generateApiKey(body.userid, timestamp, body.passphrase, secretkey)
    // console.log("apikey:%s\nsecretkey:%s",apikey,secretkey)
    var apikeyObj = {
        "userid": body.userid,
        "timestamp": timestamp + '',
        "secretkey": secretkey,
        "apikey": apikey,
        "passphrase": body.passphrase,
        "ip": body.ip
    }
    // console.log("apikeyObj:",apikeyObj)
    var filter = { "userid": body.userid }

    APIKey.findOne(filter).exec(function (err, finn) {
        if (err) {
            return res.serverError(err);
        }
        if (!finn) {
            APIKey.create(apikeyObj).exec(function (err, result) {
                console.log("create:", err, result)
                if (err) {
                    res.json(401, { err: "生成apikey失败" })
                    return
                }
                res.json(200, {
                    "userid": body.userid,
                    "secretkey": result.secretkey,
                    "apikey": result.apikey,
                    "ip": body.ip
                })
            })
        } else {
            APIKey.update({
                "userid": body.userid,
            }, {
                    "timestamp": timestamp,
                    "secretkey": secretkey,
                    "apikey": apikey,
                    "passphrase": body.passphrase,
                    "ip": body.ip
                }).exec(function afterwards(err, updated) {
                    console.log("update apikey:", err, updated)
                    if (err || updated.length == 0) {
                        res.json(401, { err: "重置apikey失败" })
                        return
                    }
                    res.json(200, {
                        "userid": updated[0].userid,
                        "secretkey": updated[0].secretkey,
                        "apikey": updated[0].apikey,
                        "ip": body.ip
                    })
                })
        }
    })
}
module.exports = {

    create: function (req, res) {
        createOrUpdateAPIKey(req, res)
    },
    update: function (req, res) {
        createOrUpdateAPIKey(req, res)
    }

};