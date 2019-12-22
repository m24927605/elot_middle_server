const FA = require('../utils/2FA');
module.exports.generate = () => FA.generate();

module.exports.verifyAdmin = (otp) => FA.twofaVerify(sails.config.globals.otp_key, otp);   