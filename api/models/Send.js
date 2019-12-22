module.exports = {
  attributes: {
    userid: {
      type: 'string',
      required: true
    },
    addressList: {
      type: 'json'
    },
    coin: {
      type: 'string',
      required: true
    }
  }
};

