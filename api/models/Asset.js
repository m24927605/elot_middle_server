/**
 * Asset.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	userid: {
      type: 'string',
      required:true
    },
    btcAvailable: {
      type: 'float',
      required:true,
      defaultsTo: 0
    },
    btcFrozen: {
      type: 'float',
      required:true,
      defaultsTo: 0
    },
    ethAvailable: {
      type: 'float',
      required:true,
      defaultsTo: 0
    },
    elotAvailable: {
      type: 'float',
      required:true,
      defaultsTo: 0
    },
    ethFrozen: {
      type: 'float',
      required:true,
      defaultsTo: 0
    },  
    elotAvailable: {
      type: 'float',
      required:true,
      defaultsTo: 0
    },
    elotFrozen: {
      type: 'float',
      required:true,
      defaultsTo: 0
    },
    eosAvailable: {
      type: 'float',
      required:true,
      defaultsTo: 0
    },
    eosFrozen: {
      type: 'float',
      required:true,
      defaultsTo: 0
    },   
    ltcAvailable: {
      type: 'float',
      required:true,
      defaultsTo: 0
    },
    ltcFrozen: {
      type: 'float',
      required:true,
      defaultsTo: 0
    },
    etcAvailable: {
      type: 'float',
      required:true,
      defaultsTo: 0
    },
    etcFrozen: {
      type: 'float',
      required:true,
      defaultsTo: 0
    },
    bchAvailable: {
      type: 'float',
      required:true,
      defaultsTo: 0
    },
    bchFrozen: {
      type: 'float',
      required:true,
      defaultsTo: 0
    },
    usdtAvailable: {
      type: 'float',
      required:true,
      defaultsTo: 0
    },
    usdtFrozen: {
      type: 'float',
      required:true,
      defaultsTo: 0
    }          


  }
};

