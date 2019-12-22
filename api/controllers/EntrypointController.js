/**
 * EntrypointController
 *这个对象是一个接入点，用户发送到entrypoint的post请求，通过post请求可以通过
  isApikeyAuth的鉴权。根据JSON RPC请求转发的viabtc的服务器完成鉴权和调用
 */

module.exports = {
    create: function (req, res, next) {
    }
};

