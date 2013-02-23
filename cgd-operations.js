var util = require("util");
var api = require("./cgd-api");

var dateParser = /^\d{2}(\d{2})-(\d{1,2})-(\d{1,2})/;

function convertToDate(value) {
	if(typeof(value) === "string") {
		var dateMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);
		return new Date(parseInt(dateMatch[1]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[3]));
	} else {
		return value;
	}
}

function displayMovementsHeader() {
	//util.puts("date; paymode; info; payee; description; amount; category");
}

function selectAccount(accounts, accountKeyOrNumber) {
	var result;
	if(typeof(accountKeyOrNumber) === "string" && !/^\d+$/.test(accountKeyOrNumber)) {
		result = accounts.filter(function(a) { return a.des.contains(accountKeyOrNumber); })[0];
	} else {
		result = accounts[accountKeyOrNumber];
	}
	if(result == null) {
		throw "Could not find account " + accountKeyOrNumber;
	}

	console.warn("Selected account " + result.des);

	return result;
}

function displayMovements(movements) {
	movements.lmov.forEach(function(mv) {
		var dateMatch = dateParser.exec(mv.dt);
		var date = util.format("%s-%s-%s", dateMatch[3], dateMatch[2], dateMatch[1]);
		util.puts(util.format("%s;%s;%s;%s;%s;%s;%s", date, 0, "id:" + mv.nmv, "", mv.des, mv.mon / (mv.tpm == "D" ? -100 : 100), "", ""));
	});
}

exports.listAccounts = function(accountNumber, password) {
	api.login(accountNumber, password, function(cookie, response) {
		var accounts = response.lcnt.map(function(e, i) { return { number: i, key: e.key, description: e.des }; });
		console.log(accounts);
	});
}

exports.getAccountBalance = function(accountNumber, password, accountKeyOrNumber) {
	api.login(accountNumber, password, function(cookie, response) {
		api.getAccountDetails(cookie, selectAccount(response.lcnt, accountKeyOrNumber).key, function(response) {
			console.log({ balance: (response.slds.scnt / 100).toFixed(2), available: (response.slds.sdsp / 100).toFixed(2) });
		});
	});
}

exports.exportLatestMovements = function(accountNumber, password, accountKeyOrNumber) {
	api.login(accountNumber, password, function(cookie, response) {
		api.getAccountDetails(cookie, selectAccount(response.lcnt, accountKeyOrNumber).key, function(response) {
			displayMovementsHeader();
			displayMovements(response);
		});
	});
}

exports.exportMovements = function(accountNumber, password, accountKeyOrNumber, startDate, endDate) {
	api.login(accountNumber, password, function(cookie, response) {
	
		startDate = convertToDate(startDate);
		endDate = convertToDate(endDate);

		console.warn("Exporting movements between " + startDate + " and " + endDate);

		displayMovementsHeader();
		api.getAccountMovements(cookie, selectAccount(response.lcnt, accountKeyOrNumber).key, startDate, endDate, function(page) {
			displayMovements(page);
			//console.warn("Balance: " + page.lmov[page.lmov.length - 1].saps / 100);
		});
	});
}


