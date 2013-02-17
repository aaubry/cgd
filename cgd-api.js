var querystring = require("querystring");
var util = require("util");
var client = require("https");
var debugClient = require("http");

function formatDate(date) {
	var year = date.getFullYear();
	var month = (date.getMonth() + 1);
	var day = date.getDate();
	return util.format(
		"%d-%s-%s",
		year,
		month < 10 ? "0" + month : month,
		day < 10 ? "0" + day : day
	);
}

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

function performRequest(options, processResponse, postData, debugMode) {
	var dataString;
	if(postData) {
		dataString = JSON.stringify(postData);
		options.headers["Content-Type"] = "Content-Type: application/json; charset=utf-8";
		options.headers["Content-Length"] = postData.length;
	}

	var req = (debugMode ? debugClient : client).request(options, function(res) {
		if(res.statusCode != 200) {
			console.error("Received error status code: " + res.statusCode);
			throw "Requet failed";
		}

		res.on("data", function(d) {
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

exports.getAccountMovements = function(cookie, accountKey, startDate, endDate, onPageReceived) {
	var data = {
		cnt: accountKey,
		dti: formatDate(startDate),
		dtf: formatDate(endDate),
		pkl: null
	};

	var options = createOptions("POST", "/apps/r/cnt/dc/m", cookie);

	var processResponse = function(page) {
		console.log(page);
	};

	console.log("Performing get movements request");
	performRequest(options, processResponse, data);
}



