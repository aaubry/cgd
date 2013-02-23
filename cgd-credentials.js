var operations = require("./cgd-operations");
var fs = require("fs");

function makeExecuteWithCredentials(operation) {
	return function() {
		var args = Array.prototype.slice.call(arguments);
	
		fs.readFile("credentials.json", "utf-8", function(err, data) {
			if(err) {
				console.error("Could not read credentials from credentials.json: " + err);
				throw "Could not read credentials";
			}

			var credentials = JSON.parse(data);
			args.unshift(credentials.accountNumber, credentials.password);
			operation.apply(null, args);
		});
	}
}

for(var fn in operations) {
	exports[fn] = makeExecuteWithCredentials(operations[fn]);
}

