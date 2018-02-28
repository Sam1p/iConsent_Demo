var express = require('express');
var https = require("https");
var http = require("http");
var fse = require("fs-extra");
var path = require('path');

var privateKey  = fse.readFileSync('sslcert/key.pem', 'utf8');
var certificate = fse.readFileSync('sslcert/cert.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};

var BC_HOST = '192.168.43.235';
var BC_PATH = 'http://localhost/bloc/v2.2/users/sam/d5a39c00dbcf6e67c7af7138018d23590cac6346/contract/ConsentContract2/0ffbac4d01a0766e0a27ac739d37092849b2d52b/call?resolve=';
var BU_DATA = {
	"user":"ryan",
	"other_user":"Sam's Pharmaceuticals",
	"message":"9438n5v34875nv93475v934n579v4798n",
	"lat":"43.6627958",
	"long":"-79.3868547",
	"smile":"0.027",
	"age" : "26",
	"gender" : "male",
	"glasses" : "glasses",
	"emotion" : JSON.stringify({
		"anger":0,
		"contempt":0,
		"disgust":0,
		"fear":0,
		"happiness":0.008,
		"neutral":0.992,
		"sadness":0,
		"surprise":0
	}),
	"text_sentiment":"0.8895276784896851"
};

// start express module
var app = express();

app.use(express.static(path.join(__dirname, 'public')));


/*
saveResult([43.6495826,-79.3787611,0.01,0.8895276784896851], function() {
	console.log('ok');
}, function(message) {
	console.log(message);
});
getResult(function(data) {
	console.log(data);
}, function(message) {
	console.log(message);
});
*/


/**
 *  Home page http request handler.
 */
/*
app.get('/foo', function(req, res) {
	res.header('Content-Type', "text/html; charset=utf-8");
	res.sendFile(path.join(__dirname, 'public/foo.html'));
});
*/
var TEMP_BC_DATA = {};

app.get('/text_sentiment', function(req, res) {
	res.setHeader('Content-Type', 'application/json');

	var user_message = req.query.str;
	console.log("User said:", user_message);

	getSentiment(user_message, function(value) {
		res.send(JSON.stringify({
			'value' : value
		}));
	}, function(message) {
		console.error(message);
		res.status(500);
		res.send({"message":message});
	});
});
app.get('/submitConsent', function(req, res) {

	TEMP_BC_DATA = req.query;
	console.log(JSON.stringify(req.query));

	res.setHeader('Content-Type', 'application/json');


	res.send(JSON.stringify({
		'status' : 'ok'
	}));

	// For actually storing on Blockchain (stubbed for now)
	/*
	saveResult(req.query, function() {
		res.send(JSON.stringify({
			'status' : 'ok'
		}));
	}, function(message) {

		//console.error(message);
		//res.status(500);
		//res.send({"message":message});

		res.send(JSON.stringify({
			'status' : 'ok'
		}));
	});*/

});
app.get('/getConsent', function(req, res) {

	res.setHeader('Content-Type', 'application/json');

	// Connect to blockchain to retrieve data

	/*getResult(function(data) {
		res.send(JSON.stringify(data));
	}, function(message) {

		//console.error(message);
		//res.status(500);
		//res.send({"message":message});

		res.send(JSON.stringify(BU_DATA));
	});
	*/


	// FOR DEBUG
	res.send(JSON.stringify(TEMP_BC_DATA));

	/*
	// OTHER DEBUG
	var data = BU_DATA
	res.send(JSON.stringify(data));
	*/
});

// start the server
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(process.env.PORT || 3000, function () {
    var host = httpsServer.address().address;
    var port = httpsServer.address().port;

    console.log('Global Legal Hackathon started at https://%s:%s', host, port);
});

function saveResult(data, success, fail) {
	var options = {
		host : BC_HOST,
		port : 80,
		path : BC_PATH,
		method : 'POST',
		headers : {
			'accept' : 'application/json;charset=utf-8',
			'content-type' : 'application/json;charset=utf-8'
		}
	};
	var req = http.request(options, function(res) {
		var buffer = "";
		res.on('data', function(chunk) {
			buffer += chunk;
		});
		res.on('end', function() {
			var msg = buffer.toString();
			success();
		});
	});
	req.on('error', function(e) {
		fail(e.message);
	});

	var full_data = JSON.stringify({
		args : {consent : JSON.stringify(data)},
		value : 0,
		method : 'storeConsent',
		password : 'sam'
	});

	req.write(full_data);
	req.end();
}

function getResult(success, fail) {
	var options = {
		host : BC_HOST,
		port : 80,
		path : BC_PATH,
		method : 'POST',
		headers : {
			'accept' : 'application/json;charset=utf-8',
			'content-type' : 'application/json;charset=utf-8'
		}
	};
	var req = http.request(options, function(res) {
		var buffer = "";
		res.on('data', function(chunk) {
			buffer += chunk;
		});
		res.on('end', function() {
			var json = JSON.parse(buffer.toString());
			var data = json.data.contents;
			if (data.length > 0) {
				success(JSON.parse(data[0]));
			} else {
				fail("No data on blockchain");
			}
		});
	});
	req.on('error', function(e) {
		fail(e.message);
	});

	req.write(JSON.stringify({
		args : {},
		value : 0,
		method : 'showConsent',
		password : 'sam'
	}));
	req.end();
}

function getSentiment(user_message, success, fail) {
	// **********************************************
	// *** Update or verify the following values. ***
	// **********************************************

	// Replace the accessKey string value with your valid access key.
	let accessKey = 'a48d87920ded49cf8a6d83558e97fe4f';

	// Replace or verify the region.

	// You must use the same region in your REST API call as you used to obtain your access keys.
	// For example, if you obtained your access keys from the westus region, replace
	// "westcentralus" in the URI below with "westus".

	// NOTE: Free trial access keys are generated in the westcentralus region, so if you are using
	// a free trial access key, you should not need to change this region.
	let response_handler = function (response) {
		let body = '';
		response.on ('data', function (d) {
			body += d;
		});
		response.on ('end', function () {
			let body_ = JSON.parse (body);
			//let body__ = JSON.stringify (body_, null, '  ');
			//console.log (body__);
			success(body_.documents[0].score);
		});
		response.on ('error', function (e) {
			fail (e.message);
		});
	};

	let get_language = function (documents) {
		let body = JSON.stringify (documents);

		let request_params = {
			method : 'POST',
			hostname : 'westcentralus.api.cognitive.microsoft.com',
			path : '/text/analytics/v2.0/sentiment',
			headers : {
				'Ocp-Apim-Subscription-Key' : accessKey,
			}
		};

		let req = https.request (request_params, response_handler);
		req.write (body);
		req.end ();
	}

	/*
	let documents = { 'documents': [
		{ 'id': '1', 'language': 'en', 'text': 'I really enjoy the new XBox One S. It has a clean look, it has 4K/HDR resolution and it is affordable.' },
		{ 'id': '2', 'language': 'es', 'text': 'I hate my life.' },
	]};

	get_language (documents);
	*/

	get_language({
		'documents' : [
			{ 'id': '1', 'language': 'en', 'text': user_message }
		]
	});
}
