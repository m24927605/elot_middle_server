/**
 * APIKey.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
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
      required: true,
      primaryKey: true
  
    },
    apikey: {
      type: 'string',
      required: true
    },
    secrectkey: {
      type: 'string',
    },
    passphrase: {
      type: 'string',
      required: true
    },
    timestamp: {
      type: 'string',
      required: true
    },
    ip: {
      type: 'string'
    }
  },

};

