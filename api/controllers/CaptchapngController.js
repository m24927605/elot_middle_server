/**
 * CaptchapngController
 * 发送验证码的简单API工具
 */
const NodeCache = require("node-cache");
var captchapng = require('captchapng');
const Cache = new NodeCache({ stdTTL: 120, checkperiod: 120 });

module.exports = {
    create: function (req, res) {
        var id = req.body.id;
        var code = parseInt(Math.random() * 9000 + 1000);
        var p = new captchapng(80, 30, code); // width,height,numeric captcha
        p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
        p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)

        var img = p.getBase64();
        //var imgbase64 = new Buffer(img,'base64');
        console.log("generateCode", code);
        Cache.set(id, code, function (err, success) {
            if (!err && success) {
                res.json({ image: "data:image/png;base64," + img });
            } else {
                sails.info.log(err);
            }
        });
    },
    verifyImg: function (req, res) {
        var verify = req.body;
        var code = Cache.get(verify.id);
        console.log(code);

        if (code == verify.code) {
            res.json({ success: code });
        }
        else {
            res.json({ error: "code_timeout_or_wrong" });
        }

    }

};

