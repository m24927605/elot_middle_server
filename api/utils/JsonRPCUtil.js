const request = require('request');
const url_str = sails.config.trader.trade_server;
const JsonRPCUtil = () => { };
JsonRPCUtil.Get = (url) => {
    return new Promise((resolve, reject) => {
        const headers = { "content-type": "application/json" };
        const options = {
            url: url,
            method: 'GET',
            headers: headers
        };

        request.get(options, (error, response, body) => {
            if (error) {
                return reject(error);
            } else {
                return resolve(body);
            }
        });

    });
}

JsonRPCUtil.PostV2 = (jsondata, url) => {
    sails.log.info('[JsonRPCUtil.PostV2] start : jsondata :' + JSON.stringify(jsondata) + ' url: ' + url);
    return new Promise((resolve, reject) => {
        const headers = { "content-type": "application/json" };
        const options = {
            url: url,
            method: 'POST',
            headers: headers,
            json: jsondata
        };
        request.post(options, (error, response, body) => {
            if (error) {
                return reject(error);
            } else {
                return resolve(body);
            }
        });
    });
}

JsonRPCUtil.Post = (jsondata, url) => {
    if (!url) {
        url = url_str;
    }
    return new Promise((resolve, reject) => {
        const headers = { "content-type": "application/json" };
        const options = {
            url: url,
            method: 'POST',
            headers: headers,
            json: jsondata
        };

        request.post(options, (error, response, body) => {
            if (!body) {
                return reject(error);
            }
            if (body.error) {
                const error = {};
                error.message = body.error;
                return reject(error);
            } else {
                return resolve(body);
            }
        });

    });
}

module.exports = JsonRPCUtil;