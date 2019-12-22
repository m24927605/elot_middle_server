var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var transporter = nodemailer.createTransport(smtpTransport({ host: 'smtp.doxdox.conoha.io', secure: true, port: 465, auth: { user: "admin@doxdox.conoha.io", pass: "Zaq12wsx@@" }, tls: { rejectUnauthorized: false } }));

module.exports = {
  sendMail: function (mailOptions) {
    sails.log.info('[APIMailService.sendMail] start mailOptions: ' + mailOptions);
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          reject(error);
        } else {
          resolve(info);
        }
      });
    });
  },
  generateMailHtml: function (metadataCode, code1, code2, code3, code4) {
    sails.log.info('[APIMailService.generateMailHtml] start : metadataCode:' + metadataCode + ' code1:' + code1 + ' code2:' + code2 + ' code3:' + code3 + ' code4:' + code4);
    return new Promise((resolve, reject) => {
      GeneralMetaData.findOne({ code: metadataCode }).exec(function (err, record) {
        if (err || (!record)) {
          reject({ error: "GeneralMetaData_Table_Code_" + metadataCode + "_htmlTemplate_Not_existed" })
        } else {
          var html = "";
          if (code1)
            html = record.description.replace("##value1##", code1);
          if (code2)
            html = html.replace("##value2##", code2)
          if (code3)
            html = html.replace("##value3##", code3)
          if (code4)
            html = html.replace("##value4##", code4);

          sails.log.info('[APIMailService.generateMailHtml] end: html' + html);
          resolve(html);
        }
      });
    });
  }

}