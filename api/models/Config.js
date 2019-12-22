module.exports = {
    attributes: {
        coin: {
            type: 'string',
            required:true,
            primaryKey: true
        },
        confirmBlockNumer:{
            type:'integer',
            required:true
        },
        inAddress:{
            type:'string',
            required:true
        },
        inEncryptedPK:{
            type:'string',
            required:true
        },
        outEncryptedPK:{
            type:'string',
            required:true
        },
        outAddress:{
            type:'string',
            required:true
        },
        receiveThreshold:{
            type:'float',
            required:true
        },
        sendThreshold:{
            type:'float',
            required:true
        },
        sendTransferFee:{
            type:'float',
            required:true
        },
        receiveTransferFee:{
            type:'float',
            required:true
        },
        decimal:{
            type:'string'
        },
        contract:{
            type:'string'
        },
    }
};
  