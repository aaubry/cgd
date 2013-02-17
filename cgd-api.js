var client = require("https");
var debugClient = require("http");

function createOptions(method, path, cookie, debugMode) {
	var options = {
		hostname: "m.caixadirecta.cgd.pt",
		port: 443,
		path: path,
		method: method,
		headers: {
			"X-CGD-APP-Device": "w8",
			"X-CGD-APP-Version": "2.1"
		}
	};

	if(cookie) {
		options.headers["Cookie"] = cookie.name + "=" + cookie.value; 
	}

	if(debugMode) {
		options.hostname = "192.168.1.1";
		options.port = 8888;
	}

	return options;
}

function performRequest(options, processResponse, debugMode) {
	var req = (debugMode ? debugClient : client).request(options, function(res) {
		if(res.statusCode != 200) {
			console.error("Received error status code: " + res.statusCode);
			throw "Requet failed";
		}

		res.on("data", function(d) {
			processResponse(JSON.parse(d), res.headers);
		});
	});

	req.end();

	req.on("error", function(e) {
		  console.error(e);
		  throw "Request error";
	});
}

exports.login = function(accountNumber, password, onComplete) {

	var options = createOptions("GET", "/apps/r/co/li?u=" + accountNumber);
	options.auth = accountNumber + ":" + password;

	console.log("Performing login request");
	performRequest(options, function(response, headers) {
		var setCookie = headers["set-cookie"][0];
		var cookieParser = /^([^=]+)=([^;]+)/;
		var match = cookieParser.exec(setCookie);
			
		var cookie = { name: match[1], value: match[2] };
		onComplete(cookie, response);
	});
}

exports.getAccountDetails = function(cookie, accountKey, onComplete) {
	var options = createOptions("GET", "/apps/r/cnt/sm/" + encodeURIComponent(accountKey), cookie);
	
	console.log("Performing get account details request");
	performRequest(options, onComplete);
}


