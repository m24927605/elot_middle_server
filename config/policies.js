/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.policies.html
 */


module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions (`true` allows public     *
  * access)                                                                  *
  *                                                                          *
  ***************************************************************************/

  '*': ['isAuthorized'], // Everything resctricted here
  'UsersController': {
    '*': true // We dont need authorization here, allowing public access
    
  },
  'TradeController': {
    '*': true,
    cancel:'isAuthorized',
    putlimit:'isAuthorized',
    getBalance:'isAuthorized',
    getPendingOrder: 'isAuthorized',
    getFinishedOrder:'isAuthorized',
    getHistoryOrder:'isAuthorized',
    //fetchAssetTx:'isAuthorized',
  },
  'SendController': {
    '*': true,
    findorCreateSendAddresses:'isAuthorized',
    updateSendAddresses:'isAuthorized',
    create:'isAuthorized',
  },
  'ReceiveController': {
    '*': true,
    create:'isAuthorized',
  },
  
  'AuthController': {
    '*': true // We dont need authorization here, allowing public access
  },

  'ConfigController': {
    '*': true // We dont need authorization here, allowing public access
  },

  'EmailsenderController': {
    '*': true // We dont need authorization here, allowing public access
  }
  ,

  'EmailGerneralService': {
    '*': true // We dont need authorization here, allowing public access
  },

  'EmailVerifyController': {
    '*': true // We dont need authorization here, allowing public access
  },
  
  'GeneralDataController': {
    '*': true // We dont need authorization here, allowing public access
  },

  'GeneralMetaDataController': {
    '*': true // We dont need authorization here, allowing public access
  },
  
  'CaptchapngController': {
    '*': true // We dont need authorization here, allowing public access
  },

  'APIKeyController': {
    '*': true, // We dont need authorization here, allowing public access
  },
  'EntrypointController': {
    '*': true, // We dont need authorization here, allowing public access
    'create': 'isApikeyAuth'
  },
  'TransferController': {
    '*': true ,
    qrcode:'isAuthorized',
    getticker:'isAuthorized',
  }
};
