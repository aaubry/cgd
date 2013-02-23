var operations = require("./cgd-credentials");

var args = process.argv.splice(2);

if(args[0] == "listAccounts" && args.length == 1) {
	operations.listAccounts();
} else if(args[0] == "getAccountBalance" && args.length == 2) {
	operations.getAccountBalance(args[1]);
} else if(args[0] == "exportLatestMovements" && args.length == 2) {
	operations.exportLatestMovements(args[1]);
} else if(args[0] == "exportMovements" && args.length == 4) {
	operations.exportMovements(args[1], args[2], args[3]);
} else {
	console.log("Usage:");
	console.log("  node main.js listAccounts"); 
	console.log("  node main.js exportLatestMovements <accountKeyOrNumber>"); 
	console.log("  node main.js exportMovements <accountKeyOrNumber> <startDate> <endDate>"); 
}

