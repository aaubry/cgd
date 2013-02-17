var movements = require("./cgd-movements");
var fs = require("fs");

fs.readFile("credentials.json", "utf-8", function(err, data) {
	if(err) {
		console.error("Could not read credentials from credentials.json: " + err);
		throw "Could not read credentials";
	}

	var credentials = JSON.parse(data);
	movements.exportMovements(credentials.accountNumber, credentials.password, new Date(2013, 0, 1), new Date(2014, 0, 1));
});

//movements.exportLatestMovements(credentials.accountNumber, credentials.password);

