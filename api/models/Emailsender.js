/**
 * Emailsender.js
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
     from: {
         type: 'string'
     },
     to: {
         type: 'string'
     },
     subject: {
         type: 'string'
     },
     text: {
         type: 'string'
     },
     telephone: {
         type: 'string'
     },
     name:{
     	type: 'string'
     },
     emailinfo:{
     	type:'json'
     }
  }
};

