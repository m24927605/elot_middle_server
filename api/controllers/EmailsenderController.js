/**
 * EmailsenderController
 * 可以用于官网的联系人发送邮件的API
 */

module.exports = {
	create: function (req, res) {

		var mailData = req.body;

		var mailOptions = {
			from: mailData.from,
			to: mailData.to,
			subject: mailData.subject,
			text: mailData.text
		};

		// var mailOptions = {
		// 					from: "admin@populstay.com",
		// 					  to: 'eric_dwj@icloud.com',
		// 				 subject: "test",
		// 					text: "test"
		// 					};
		APIMailService.sendMail(mailOptions).then((info) => {
			var mailObj = {};
			mailObj.from = mailData.from;
			mailObj.to = mailData.to;
			mailObj.subject = mailData.subject;
			mailObj.text = mailData.text;
			mailObj.telephone = mailData.telephone;
			mailObj.name = mailData.name;
			mailObj.emailinfo = info;

			Emailsender.create(mailObj).exec(function (err, data) {
				res.json(data);

			});
		});

	}

};



