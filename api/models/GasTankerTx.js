module.exports = {
    attributes: {
        userid: {
            type: 'string',
            required:true
        },
        asset:{
            type:'string',
            required:true
        },
        size:{
            type:'float',
            required:true
        },
        status:{
            type:'string',//SUBMITTED, CONFIRMED
            required:true
        },
        tx:{
            type:'string',
            required:true
        }
    }
  };
  
  