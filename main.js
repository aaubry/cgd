#!/usr/local/bin/node

var argv = require("optimist")
	.usage("Interact with a home banking service.\nUsage: $0")
	.boolean("list-services")
		.describe("list-services", "Lists the configured services")
	
	.boolean("l")
		.alias("l", "list-accounts")
		.describe("l", "List the available accounts")
	.boolean("m")
		.alias("m", "export-movements")
		.describe("m", "Exports account movements to csv")
	.boolean("b")
		.alias("b", "get-balance")
		.describe("b", "Gets account balance")
	.string("a")
		.alias("a", "account")
		.describe("a", "The account number")
	.check(function(argv) {
		var flagCount = [argv.l, argv.m, argv.b].reduce(function(a, v) { return v ? a + 1 : a; }, 0);
		if(flagCount != 1) {
			throw "One action must be supplied.";
		}

		if(!argv.s && 

		if(!argv.l && !argv.s && argv.a == null) {
			throw "Account not specified.";
		}
	})
	.argv;

var operations = require("./cgd-credentials");

if(argv.l) {
	operations.listAccounts();
} else if(argv.b) {
	operations.getAccountBalance(argv.a);
} else if(argv.m) {
	operations.exportLatestMovements(argv.a);
}

/*
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
*/
