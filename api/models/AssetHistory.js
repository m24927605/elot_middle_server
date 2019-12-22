/**
 * AssetHistory.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	id: {
      type: 'number',
      autoIncrement: true,
      primaryKey: true
    },
    userid: {
      type: 'string',
      required:true
    },
    asset:{
       type:'string',
       required:true
    },
    amount:{
    	type:'float',
    	required:true
    },
    timestamp:{
    	type:'string',
    	required:true
    },
    side:{
    	type:'int',
    	required:true
    },
    // assets_history_side_deposit                  : 1,
    // assets_history_side_withdraw                 : 2,
    txid:{
      type:'string',
      required:true
    },
    state:{
    	type:'string',
    	required:true
    },
   // assets_history_state_deposited_unchecked     : 1,
   // assets_history_state_deposited_checked       : 2,
   // assets_history_state_withdraw_unchecked      : 3,
   // assets_history_state_withdraw_checked        : 4,
    detail:{
      type:'json'
    }

  }
};

