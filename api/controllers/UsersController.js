
let CommonUtil = require('../utils/CommonUtil')
module.exports = {
  isLogin: function (req, res) {
    if (!req.body.token) {
      return res.json({ islogin: false })
    } else {
      APIJWTokenService.verify(req.body.token).then((result) => {
        if (result) {
          return res.json({ islogin: true })
        } else {
          return res.json({ islogin: false })
        }
      })
    }
  },

  findByUserid: function (req, res) {

    if (!req.body.userid) {
      return res.json({ err: sails.config.constant.userid_required })
    }

    WalletUserService.getUserById(req.body.userid).then((user) => {
      if (user) {
        return res.json(200, user);
      } else {
        return res.json(200, { userid: req.body.userid, state: sails.config.constant.user_not_found })
      }
    });
  },

  findByEmail: function (req, res) {

    if (!req.body.email) {
      return res.json({ err: sails.config.constant.email_null })
    }

    if (!CommonUtil.validateEmail(req.body.email)) {
      return res.json({ err: sails.config.constant.email_format_illegal });
    }

    WalletUserService.getAccountByEmail(req.body.email).then((user) => {
      if (user) {
        return res.json(200, user);
      } else {
        return res.json(200, { email: req.body.email, state: sails.config.constant.user_not_found })
      }
    });
  },
  create: function (req, res) {
    const userobj = req.body;

    if (req.body.password !== req.body.repeatPassword) {
      return res.json({ err: sails.config.constant.password_not_match });
    }

    if (!req.body.email) {
      return res.json({ err: sails.config.constant.email_null })
    }

    if(req.body.role && !sails.config.constant.user_role.test(req.body.role)){
      return res.json({err: req.body.role})
    }

    if (!CommonUtil.validateEmail(req.body.email)) {
      return res.json({ err: sails.config.constant.email_format_illegal });
    }

    WalletUserService.register(userobj).then((user) => {
      res.json(200, {
        user: user, token: APIJWTokenService.issue({
          userid: user.userid,
          ts: new Date().getTime(),
          email: user.email,
          role: user.role
        })
      });
    }).catch((err) => {
      return res.json(err.status, { err: err });
    });
  },

  login: function (req, res) {
    const userobj = req.body;

    if (!req.body.email) {
      return res.json({ err: sails.config.constant.email_null })
    }

    if (!CommonUtil.validateEmail(req.body.email)) {
      return res.json({ err: sails.config.constant.email_format_illegal });
    }

    if (!req.body.password) {
      return res.json({ err: sails.config.constant.email_password_required });
    }

    WalletUserService.getAccountByEmail(userobj.email).then((user) => {
      if (!user) {
        return res.json(401, { err: sails.config.constant.invalid_email_password });
      }

      Users.comparePassword(req.body.password, user, function (err, valid) {
        if (err) {
          return res.json(403, { err: sails.config.constant.inner_err });
        } else if (!valid) {
          return res.json(401, { err: sails.config.constant.invalid_email_password });
        } else {
          return res.json(200, {
            user: user, token: APIJWTokenService.issue({
              userid: user.userid,
              ts: new Date().getTime(),
              email: user.email,
              role: user.role
            })
          });
        }
      });
    }).catch((err) => {
      return res.json(err.status, { err: err });
    });
  }
};






