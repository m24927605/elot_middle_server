/**
 * EmailVerifyController
 * 验证码发送和椒盐的组件和CaptchapngController一起使用
 */
const NodeCache = require("node-cache");
const Cache = new NodeCache({ stdTTL: 120, checkperiod: 120 });
module.exports = {
	sendVerificationEmail: function (req, res) {
		var mailData = req.body;
		var code1 =
			Math.floor(Math.random() * 10) + "" +
			Math.floor(Math.random() * 10) + "" +
			Math.floor(Math.random() * 10) + "" +
			Math.floor(Math.random() * 10);


		APIMailService.generateMailHtml("002", code1).then((html) => {
			var mailOptions = {
				from: mailData.from,
				to: mailData.to,
				subject: mailData.subject,
				html: html
			};
			APIMailService.sendMail(mailOptions).then((info) => {
				var obj = { code: code1 };
				console.log(info);
				Cache.set(mailData.to, obj, function (err, success) {
					if (!err && success) {
						res.json({ emailinfo: info });
					} else {
						console.log(err);
					}
				});
			});

		}).catch((err) => {
			console.log(err);
		})


	}
	, verifyEmail: function (req, res) {
		var mailData = req.body;
		var obj = Cache.get(mailData.to);
		console.log("Cache.get(mailData.to)", obj);
		if (obj.code == mailData.code) {
			res.json({ success: obj.code });
		}
		else {
			res.json({ error: "code_timeout_or_wrong" });
		}

	}

};

