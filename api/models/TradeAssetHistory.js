/**
 * TradeAssetHistory.js
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
    state:{
    	type:'string',
    	required:true
    },
    fee:{
      type:'string'
    },
    inout:{
      type:'int'
    },
    detail:{
      type:'json'
    }

  }
};

