const SettlementUtil = () => { };
const DBUtil = require('../utils/DBUtil');
SettlementUtil.add = (rec) =>{
    sails.log.info('[SettlementUtil.add] start: settlement ' + rec);
    return DBUtil.addSettlement(rec);
}
module.exports = SettlementUtil;