var util = require("util");
var api = require("./cgd-api");

var dateParser = /^\d{2}(\d{2})-(\d{1,2})-(\d{1,2})/;

function displayMovementsHeader() {
	//util.puts("date; paymode; info; payee; description; amount; category");
}

function displayMovements(movements) {
	movements.lmov.forEach(function(mv) {
		var dateMatch = dateParser.exec(mv.dt);
		var date = util.format("%s-%s-%s", dateMatch[3], dateMatch[2], dateMatch[1]);
		util.puts(util.format("%s;%s;%s;%s;%s;%s;%s", date, 0, "", "", mv.des, mv.mon / (mv.tpm == "D" ? -100 : 100), "", ""));
	});
}

exports.exportLatestMovements = function(accountNumber, password) {
	api.login(accountNumber, password, function(cookie, response) {
		api.getAccountDetails(cookie, response.lcnt[0].key, function(response) {
			displayMovementsHeader();
			displayMovements(response);
		});
	});
}

exports.exportMovements = function(accountNumber, password, startDate, endDate) {
	api.login(accountNumber, password, function(cookie, response) {
		
		displayMovementsHeader();
		api.getAccountMovements(cookie, response.lcnt[0].key, startDate, endDate, function(page) {
			displayMovements(page);
		});
	});
}


