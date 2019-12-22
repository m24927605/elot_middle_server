const jwt = require('jsonwebtoken');
const md5 = require('md5');
const tokenSecret = md5('Trader_V1');

// Generates a token from supplied payload
module.exports.issue = function (payload) {
  sails.log.info('[APIJWTokenService.issue] start: payload:' + JSON.stringify(payload));
  const token = jwt.sign(payload, tokenSecret, { expiresIn: '100000h' });
  return token;
};

// Verifies token on a request
module.exports.verify = function (token) {
  sails.log.info('[APIJWTokenService.verify] start: token:' + token);
  return new Promise(resolve => {
    try {
      const decode = jwt.verify(token, tokenSecret);
      console.log('[jwt token decode]',decode)
      resolve(decode);
    } catch (error) {
      console.log('[jwt token decode error]',error)
      resolve(false);
    }
  });
};