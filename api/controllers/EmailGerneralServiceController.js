module.exports = {
	create: function (req, res) {
		sails.log.info('[EmailGerneralServiceController] start : metadataCode:' + req.body.metadataCode + ' value1:' + req.body.value1 + ' value2:' + req.body.value2 + ' value3:' + req.body.value3 + ' value4:' + req.body.value4);
		const mailData = req.body;
		APIMailService.generateMailHtml(mailData.metadataCode, mailData.value1, mailData.value2, mailData.value3, mailData.value4).then((html) => {
			const mailOptions = { from: mailData.from, to: mailData.to, subject: mailData.subject, html: html };
			APIMailService.sendMail(mailOptions).then((info) => {
				res.json({ emailinfo: info });
			});
		}).catch((err) => {
			res.json({ error: err });
		})
	}

};

