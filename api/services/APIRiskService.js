const CommonUtil = require('../utils/CommonUtil');
const QueueUtil = require('../utils/QueueUtil');
const riskUtil = require('../utils/RiskUtil')
module.exports = {
    startSchedule: function () {
        CommonUtil.scheduler(sails.config.globals.riskSchedule, () => {
            QueueUtil.addQueue(riskUtil.caculateTotalAssets);
        });
    }
}