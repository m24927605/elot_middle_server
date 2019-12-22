/**
 * isAuthorized
 *
 * @description :: Policy to check if user is authorized with JSON web token
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Policies
 */

module.exports = function (req, res, next) {
  sails.log.info('[isAuthorized] start ');

  const otp = req.headers.otp;
  if (otp && API2FAService.verifyAdmin(otp)) {
    return next();
  }

  let token;
  if (req.headers && req.headers.authorization) {
    let parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
      let scheme = parts[0], credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
    } else {
      return res.json(401, { err: 'Format is Authorization: Bearer [token]' });
    }
  } else if (req.param('token')) {
    token = req.param('token');
    delete req.query.token;
  } else {
    return res.json(401, { err: 'No Authorization header was found' });
  }

  APIJWTokenService.verify(token).then((result) => {
    sails.log.info('[isAuthorized] authorize result :' + JSON.stringify(result));
    if (result) {
      if (req.body) {
        req.body.userid = result.userid;
        req.body.email = result.email;
      }
      sails.log.info('[isAuthorized] userid ' + result.userid);
      req.token = token;
      next();
    } else {
      res.json(401, { err: 'Invalid Token!' });
    }
  });
};