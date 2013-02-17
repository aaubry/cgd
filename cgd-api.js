var querystring = require("querystring");
var util = require("util");
var client = require("https");
var debugClient = require("http");

var debugMode = false;

function formatTwoDigitNumber(value) {
	return (value < 10 ? "0" : "") + value;
}

function formatDate(date) {
	var year = date.getFullYear();
	var month = (date.getMonth() + 1);
	var day = date.getDate();
	return util.format(
		"%d-%s-%s %s:%s:%s",
		date.getFullYear(),
		formatTwoDigitNumber(date.getMonth() + 1),
		formatTwoDigitNumber(date.getDate()),
		formatTwoDigitNumber(date.getHours()),
		formatTwoDigitNumber(date.getMinutes()),
		formatTwoDigitNumber(date.getSeconds())
	);
}

function createOptions(method, path, cookie) {
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

function performRequest(options, processResponse, postData) {
	var dataString;
	if(postData) {
		dataString = JSON.stringify(postData);
		options.headers["Content-Type"] = "application/json; charset=utf-8";
		options.headers["Content-Length"] = dataString.length;
	}

	var req = (debugMode ? debugClient : client).request(options, function(res) {
		res.on("data", function(d) {
			if(res.statusCode != 200) {
				console.error("Received error status code: " + res.statusCode);
				console.error(d.toString());
				throw "Requets failed";
			}
			processResponse(JSON.parse(d), res.headers);
		});
	});

	if(postData) {
		req.write(dataString);
	}

	req.end();

	req.on("error", function(e) {
		  console.error(e);
		  throw "Request error";
	});
}

exports.login = function(accountNumber, password, onComplete) {

	var options = createOptions("GET", "/apps/r/co/li?u=" + accountNumber);
	options.auth = accountNumber + ":" + password;

	console.warn("Performing login request");
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
	
	console.warn("Performing get account details request");
	performRequest(options, onComplete);
}

exports.getAccountMovements = function(cookie, accountKey, startDate, endDate, onPageReceived) {
	var data = {
		cnt: accountKey,
		dti: formatDate(startDate),
		dtf: formatDate(endDate),
		pkl: null
	};

	var options = createOptions("POST", "/apps/r/cnt/dc/m", cookie);

	var processResponse = function(page) {
		onPageReceived(page);

		if(page.lp) {
			console.warn("Finished loading movements");
		} else {
			console.warn("Performing get more movements request");
			data.pkl = page.pkl;
			performRequest(options, processResponse, data);
		}
	};

	console.warn("Performing get movements request");
	performRequest(options, processResponse, data);
}



