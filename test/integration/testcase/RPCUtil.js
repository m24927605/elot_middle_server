const request = require('request');
var RPCUtil = function(){};
RPCUtil.Get = function(url){
	return new Promise((resolve, reject) => {
            var headers = {"content-type": "application/json"};
            var options = {
                            url: url,
                            method: 'GET',
                            headers: headers
                        };              
            request.get(options, (error, response, body)=> {
                if (error) {
                    return reject(error);
                }else {
                    return resolve(body);
                }
            });
	});
}

RPCUtil.PostV2 = function(jsondata,url){
    return new Promise((resolve, reject) => {
            var headers = {"content-type": "application/json"};
            var options = {
                            url: url,
                            method: 'POST',
                            headers: headers,
                            json: jsondata
                        };              
            request.post(options, (error, response, body)=> {
                if (error) {
                    return reject(error);
                }else {
                    return resolve(body);
                }
            });
    });
} 

RPCUtil.Post = function(jsondata,url){
	return new Promise((resolve, reject) => {
            var headers = {"content-type": "application/json"};
            var options = {
                            url: url,
                            method: 'POST',
                            headers: headers,
                            json: jsondata
                        };              
           
            request.post(options, (error, response, body)=> {
                if (!body) {
                    return reject(error);
                }
                if (body.error) {
                    var error = {};
                    error.message = body.error;
                    return reject(error);
                } else {
                    return resolve(body);
                }
            });
	});
}
module.exports = RPCUtil;