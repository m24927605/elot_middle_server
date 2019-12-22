module.exports = {

  attributes: {
    settlement_id: {
      type: 'string',
      required: true,
      primaryKey: true
    },
    asset: {
      type: 'string',
      required: true
    },
    userid: {
      type: 'string',
      required: true
    },
    size: {
      type: 'string',
      required: true
    }
  }
};

