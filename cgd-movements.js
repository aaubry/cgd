var util = require("util");
var api = require("./cgd-api");

exports.exportLatestMovements = function(accountNumber, password) {
	api.login(accountNumber, password, function(cookie, response) {
		api.getAccountDetails(cookie, response.lcnt[0].key, function(response) {
			util.puts(util.format("Account balance: %d", response.slds.sdse / 100));

			util.puts("date; paymode; info; payee; description; amount; category");

			var dateParser = /^\d{2}(\d{2})-(\d{1,2})-(\d{1,2})/;
			response.lmov.forEach(function(mv) {
				var dateMatch = dateParser.exec(mv.dt);
				var date = util.format("%s-%s-%s", dateMatch[3], dateMatch[2], dateMatch[1]);
				util.puts(util.format("%s; %s; %s; %s; %s; %s; %s", date, 0, mv.des, "", "", mv.mon / 100, "", ""));
			});

			util.puts(util.format("Movement count: %d", response.lmov.length));
		});
	});
}

exports.exportMovements = function(accountNumber, password, startDate, endDate) {
	api.login(accountNumber, password, function(cookie, response) {
		api.getAccountMovements(cookie, response.lcnt[0].key, startDate, endDate, function(page) {
		});
	});
}


