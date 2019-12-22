
module.exports.bootstrap =function(cb) {
		cb();
		APIAdminService.loadConfig().then(()=>{
			WalletReceiveService.run();
			WalletSendService.run();
			WalletGasTankerService.run();
			APITradeService.matchProcess();
			APIRiskService.startSchedule();
		})
		.catch((e)=>{
			console.error('err',e)
		})
};