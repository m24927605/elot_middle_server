module.exports = {
  attributes: {	
    id:{
    	type: 'int',
        required:true
    },
    market:{
    	type:'string',
    	required:true
    },
    type:{
        type:'int',
        required:true
    },
    side:{
    	type:'int',
    	required:true
    },
    user: {
        type: 'int',
        required:true
    },
    ctime:{
        type: 'float',
        required:true
    },  
    mtime:{
        type: 'float'
    },  
    ftime:{
        type: 'float'
    },  

    price:{
    	type:'string',
    	required:true
    },
    amount:{
        type:'string',
        required:true
    },
    takerfee:{
    	type:'string',
    	required:true
    },
    makerfee:{
    	type:'string',
    	required:true
    },
    left:{
         type:'string',
         required:true
    },
    dealstock:{
         type:'string',
         required:true
    },
    dealmoney:{
         type:'string',
         required:true
    },
    dealfee:{
         type:'string',
         required:true
    },
    state:{
        type:'int',
        required:true,
        defaultsTo: sails.config.order.order_state_pending
    },
    orderid:{
        type:'string',
        required:true
    }
  }
};

