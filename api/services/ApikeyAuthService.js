/**
* 鉴权用过滤器，中间鉴权需要和isApikeyAuth配合使用 
*/

var Util = require('../utils/APIUtil');

module.exports = {
    validateApikeyAuth: function(apikey, secretkey) {
        return new Promise(function (fulfill, reject) {
           var arr = Util.reduceApikey(apikey, secretkey)
           console.log("arr:",arr)
           if(!Array.isArray(arr)){
               return reject("reduce fail")
           }
           var userid = arr[0]
           var timestamp = arr[1]
           APIKey.findOne({"userid": userid}).exec(function(err, apikeyObj){
               if(err||!apikeyObj){
                   return reject("validateApikey_find null")
               }
               if(apikeyObj.timestamp!=timestamp){
                 return reject("validateApikey_timestamp expire")
               }
               console.log("validateApikey_find_result:",apikeyObj)
               return fulfill(apikeyObj)
           })
       })
    }
}