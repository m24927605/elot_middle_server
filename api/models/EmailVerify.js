/**
 * EmailVerify.js
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
     verifyEmail: {
           type: 'email',
           required: true
     },
     code:{
     	type: 'string'
     }


  }
};

