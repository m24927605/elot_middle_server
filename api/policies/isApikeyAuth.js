/**
* 鉴权用过滤器，中间鉴权需要和APIkeyAuthService配合使用 
*/


var logger = require("../../config/logger").app

module.exports = function isApikeyAuth(req, res, next){
    var apikey = req.body.apikey;
    var secretkey = req.body.secretkey;
    if(!apikey||!secretkey){
        logger.info("invalidate params:",apikey,secretkey)
        return res.json(400,{err:'invalidate params'})
    }
    var ip = req.ip.replace(/::ffff:/, '')
    APIkeyAuthService.validateApikeyAuth(apikey, secretkey)
    .then(function(result){
        console.log("reduceUserid:",result)
        //判断请求过来的IP和用户设置的操作IP是否相等
        if(result.ip !== ip){
            logger.info("invalidate apikey:%s secretkey:%s ip:%s",apikey,secretkey,ip)
            return res.json(403,{err:"操作IP和设置的IP不相同"})
        }
        // res.json(200,result)
        return TraderService.apiCall(parseInt(result.userid), req.body)
        // next()
    }).then(function(result){
        return res.json(result)
    }).catch(function(err){
        // res.json(400,{err:err})
        console.log("validateCatch:",err)
        logger.info("catch_error_apikey:%s secretkey:%s err:%s",apikey,secretkey,err)
        return res.json(500,err)
    })
}