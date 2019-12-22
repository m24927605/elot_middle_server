var path = require('path');

var log4js = require('log4js');

log4js.configure(path.join(__dirname, './log4js.json'));

module.exports = {
    express: log4js.connectLogger(log4js.getLogger('access'), {level: log4js.levels.INFO}),
    access: log4js.getLogger('access'),
    app: log4js.getLogger('app'),
    api: log4js.getLogger('api'),
    error: log4js.getLogger('error')
};