var LOCATION = function(success, fail) {
	
	function showPosition(position) {
		$('#gm-map').gmap3({
			center: [position.coords.latitude, position.coords.longitude],
			zoom: 16,
			mapTypeId : google.maps.MapTypeId.ROADMAP
		}).marker([
			{position:[position.coords.latitude, position.coords.longitude]}
		]);
		
		var msg = "Is this your location?";
		readText(msg, function(){});
		
		setTimeout(function() {
			showMessage(msg, [
				{
					name:"No", 
					click:function(e) {
						$(this.parentNode.parentNode.parentNode).remove();
						fail("Clicked no");
						return false;
					}
				},
				{
					name:"Yes", 
					click:function(e) {
						$(this.parentNode.parentNode.parentNode).remove();
						success(position.coords.latitude, position.coords.longitude);
						return false;
					}
				}
			]);
		}, 0);
	}

	function showError(error) {
		switch(error.code) {
			case error.PERMISSION_DENIED:
				fail("User denied the request for Geolocation.");
				break;
			case error.POSITION_UNAVAILABLE:
				fail("Location information is unavailable.");
				break;
			case error.TIMEOUT:
				fail("The request to get user location timed out.");
				break;
			case error.UNKNOWN_ERROR:
				fail("An unknown error occurred.");
				break;
		}
	} 
	
	this.getLocation = function() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(showPosition, showError);
		} else {
			fail("Geolocation is not supported by this browser.");
		}
	};
};

var GYROSCOPE = function(callback) {
	var alpha = null, beta = null, gamma = null;
	var moved_a_lot = false;
	var check = true;
	var callback2 = null;
	
	function handleOrientation(event) {
		if (check) {
			//var absolute = event.absolute;
			var _alpha    = event.alpha;
			var _beta     = event.beta;
			var _gamma    = event.gamma;
			
			if (alpha != null && beta != null && gamma != null) {
				var distance = Math.sqrt(Math.pow(_alpha-alpha, 2) + Math.pow(_beta-beta, 2) + Math.pow(_gamma-gamma, 2));
				
				if (distance > 7 && distance < 10) {
					moved_a_lot = true;
					window.removeEventListener("deviceorientation", handleOrientation);
					callback(distance);
					callback2();
				}
			}
			
			alpha = _alpha;
			beta = _beta;
			gamma = _gamma;
		}
	}
	
	this.listen = function(callback) {
		callback2 = callback;
		window.addEventListener("deviceorientation", handleOrientation, true);
	};
	
	this.remove = function() {
		//window.removeEventListener("deviceorientation", handleOrientation);	
		check = false;
	};
};

var AUDIO = function(success, fail) {
	
	var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
	var recognition = new SpeechRecognition();
		
	/*
	var recorder = document.getElementById('recorder');

	recorder.addEventListener('change', function(e) {
		var file = e.target.files[0];
		// Do something with the audio file.
		//player.src = URL.createObjectURL(file);
		alert(file);
	});
	*/

	recognition.onstart = function() { 
	  //document.body.innerHTML += 'Voice recognition activated. Try speaking into the microphone.<br/>';
	}

	recognition.onspeechend = function() {
	  //document.body.innerHTML += 'You were quiet for a while so voice recognition turned itself off.<br/>';
	}

	recognition.onerror = function(event) {
		if (event.error == 'no-speech') {
			fail('No speech was detected. Try again.');
		};
	}
	recognition.onresult = function(event) {

	  // event is a SpeechRecognitionEvent object.
	  // It holds all the lines we have captured so far. 
	  // We only need the current one.
	  var current = event.resultIndex;

	  // Get a transcript of what was said.
	  var transcript = event.results[current][0].transcript;

	  // Add the current transcript to the contents of our Note.
	  //noteContent += transcript;
	  //noteTextarea.val(noteContent);
	  
		var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

		if (!mobileRepeatBug) {
			//noteContent += transcript;
			//document.body.innerHTML += transcript + '<br/>';
			success(transcript);
		}
	}
		
	this.abort = function() {
		recognition.abort();
	};
	
	this.listen = function() {
		recognition.start();
	};
};

var FACE = function (success, fail) {

    this.listen = function() {

        var camera = document.getElementById('camera');

        camera.addEventListener('change', function(e) {
            var imageFile = e.target.files[0];     
            var reader = new FileReader();
            var fileType;
			
			var popup = document.createElement("div");
			popup.classList.add("glh_popup_bg");
			popup.classList.add("glh_popup_loader");
			document.body.appendChild(popup);

            //wire up the listener for the async 'loadend' event
            reader.addEventListener('loadend', function () {    
                //get the result of the async readAsArrayBuffer call
                var fileContentArrayBuffer = reader.result;

				readText("Analyzing", function(){});
                sendImage(fileContentArrayBuffer, fileType);
            });

            if (imageFile) {
                //save the mime type of the file
                fileType = imageFile.type;

                //read the file asynchronously
                reader.readAsArrayBuffer(imageFile);
            }   
        });
	};

	function sendImage(fileContentArrayBuffer, fileType) {

	
        // **********************************************
        // *** Update or verify the following values. ***
        // **********************************************

        // Replace the subscriptionKey string value with your valid subscription key.
        var subscriptionKey = "8095b3ec17b440e39c9a5d9c0f98c680";

        // Replace or verify the region.
        //
        // You must use the same region in your REST API call as you used to obtain your subscription keys.
        // For example, if you obtained your subscription keys from the westus region, replace
        // "westcentralus" in the URI below with "westus".
        //
        // NOTE: Free trial subscription keys are generated in the westcentralus region, so if you are using
        // a free trial subscription key, you should not need to change this region.
        var uriBase = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect";

        // Request parameters.
        var params = {
            //"returnFaceId": "true",
			"returnFaceId": "false",
            "returnFaceLandmarks": "false",
            //"returnFaceAttributes": "age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise",
			"returnFaceAttributes": "age,gender,smile,glasses,emotion"
        };

        // Perform the REST API call.
        $.ajax({
            url: uriBase + "?" + $.param(params),

            // Request headers.
            beforeSend: function(xhrObj){
                xhrObj.setRequestHeader("Content-Type","application/octet-stream");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
            },

			timeout:10000,
            type: "POST",

            // Request body.
			processData: false,
            data: new Blob([fileContentArrayBuffer], { type: fileType })
			
			// as url
			//data: '{"url": "https://www.taylorherring.com/blog/wp-content/uploads/2015/03/Archetypal-Male-Face-of-Beauty-embargoed-to-00.01hrs-30.03.15.jpg"}',
        }).done(function(data) {
			$(".glh_popup_loader").remove();
			
			if (data.length > 0) {
				success(data[0].faceAttributes);
			} else {
				fail("No faces detected, try again!");
			}
        }).fail(function(jqXHR, textStatus, errorThrown) {	
			$(".glh_popup_loader").remove();
            fail(errorThrown);
        });
	}
};





function readText(str, callback) {
	var msg = new SpeechSynthesisUtterance();
	var voices = window.speechSynthesis.getVoices();
	//msg.voice = voices[10]; // Note: some voices don't support altering params
	//msg.voiceURI = 'native';
	//msg.volume = 1; // 0 to 1
	//msg.rate = 1; // 0.1 to 10
	//msg.pitch = 2; //0 to 2
	msg.text = str;
	msg.lang = 'en-US';

	msg.onend = function(e) {
		callback();
	};

	speechSynthesis.speak(msg);
}


function makePopup() {
	var div = document.createElement("div");
	div.classList.add("glh_popup_bg");
	var inner = document.createElement("div");
	inner.classList.add("glh_popup_modal");
	div.appendChild(inner);
	document.body.appendChild(div);
	$(inner).hide().fadeIn(500);
	return inner;
}
function showMessage(str, buttons) {
	var inner = makePopup();
	var content = document.createElement("div");
	content.innerHTML = str;
	$(content).css({
		"font-size" : "26px"
	});
	inner.appendChild(content);
	var buttonsDiv = document.createElement("div");
	$(buttonsDiv).css({
		"display":"flex",
		"width": "100%"
	});
	buttons.map(function(b) {
		var button = document.createElement("div");
		button.innerHTML = b.name;
		button.classList.add("glh_popup_button");
		button.onclick = b.click;
		buttonsDiv.appendChild(button);
	});
	inner.appendChild(buttonsDiv);
}




// https://gist.github.com/andrei-m/982927
function dziemba_levenshtein(a, b){
	var tmp;
	if (a.length === 0) { return b.length; }
	if (b.length === 0) { return a.length; }
	if (a.length > b.length) { tmp = a; a = b; b = tmp; }

	var i, j, res, alen = a.length, blen = b.length, row = Array(alen);
	for (i = 0; i <= alen; i++) { row[i] = i; }

	for (i = 1; i <= blen; i++) {
		res = i;
		for (j = 1; j <= alen; j++) {
			tmp = row[j - 1];
			row[j - 1] = res;
			res = b[i - 1] === a[j - 1] ? tmp : Math.min(tmp + 1, Math.min(res + 1, row[j] + 1));
		}
	}
	return res;
}
// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
function hashFnv32a(str, asString, seed) {
    /*jshint bitwise:false */
    var i, l,
        hval = (seed === undefined) ? 0x811c9dc5 : seed;

    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    if( asString ){
        // Convert to 8 digit hex string
        return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
    }
    return hval >>> 0;
}



var gyro = new GYROSCOPE(function(distance) {
	var str = "You are shaking too much! Are you scared, under pressure or drunk?";
	readText(str, function(){});
	showMessage(str, [
		{
			name:"OK", 
			click:function(e) {
				$(this.parentNode.parentNode.parentNode).remove();
				return false;
			}
		}
	]);
	$(".glh_page").removeClass("glh_show");
	$(".glh_page_0").addClass("glh_show");
});


var GLOB_speak_message = 'I give my consent';
var GLOB_user = 'Ryan';
var GLOB_other_user = null;
var GLOB_consent_message = null;
var GLOB_latitude = null;
var GLOB_longitude = null;
var GLOB_smile = null;
var GLOB_age = null;
var GLOB_gender = null;
var GLOB_glasses = null;
var GLOB_emotion = null;
var GLOB_text_sentiment = null;


readText("Welcome to iConsent", function(){});

$(".glh_page_1 .glh_button").click(function() {
	handleConsentMessage();
	return false;
});

function handleConsentMessage() {
	$(".glh_page_1, .glh_page_2").toggleClass("glh_show");
	
	var url = new URL(window.location.href);
	var user = url.searchParams.get("user");
	
	GLOB_other_user = user;
	document.getElementById("user_name").innerHTML = GLOB_user;
	
	readText("Please consent to the following", function(){});
	
	$(".glh_page_2 .glh_button").click(function() {
		GLOB_consent_message = hashFnv32a(document.getElementById("consent_message").innerText, true, 5437);
		handleLocation();
		return false;
	});
}

function handleLocation() {
	$(".glh_page_2, .glh_page_3").toggleClass("glh_show");
	var locationObj = new LOCATION(function(latitude, longitude) {
		GLOB_latitude = latitude;
		GLOB_longitude = longitude;
		handleFace();
	}, function(message) {
		console.error(message);
		GLOB_latitude = 43.6627958;
		GLOB_longitude = -79.3868547;
		handleFace();
	});
	locationObj.getLocation();
}

function handleFace() {
	$(".glh_page_3, .glh_page_4").toggleClass("glh_show");
	readText("Please take an image of yourself", function(){});
	var face = new FACE(function(data) {
		GLOB_smile = data.smile;
		GLOB_age = data.age;
		GLOB_gender = data.gender;
		GLOB_glasses = data.glasses;
		GLOB_emotion = data.emotion;
		handleAudio();
	}, function(message) {
		console.error(message);
		GLOB_smile = 0.6;
		GLOB_age = 30;
		GLOB_gender = "male";
		GLOB_glasses = "glasses";
		GLOB_emotion = {
			anger:0,
			contempt:0,
			disgust:0,
			fear:0,
			happiness:0.008,
			neutral:0.992,
			sadness:0,
			surprise:0
		};
		handleAudio();
	});
	face.listen();
}

function handleAudio() {
	$(".glh_page_4, .glh_page_5").toggleClass("glh_show");
	
	document.getElementById("speak_message").innerHTML = GLOB_speak_message;
	var tim = -1;
	
	var audio = new AUDIO(function(user_message) {
		clearTimeout(tim);
		readText("You said: " + user_message, function(){});
		showMessage("You said: " + user_message, [
			{
				name:"OK", 
				click:function(e) {
					$(this.parentNode.parentNode.parentNode).remove();
					getTextSentiment(user_message);
					return false;
				}
			}
		]);
	}, function(message) {
		clearTimeout(tim);
		console.error(message);
		getTextSentiment("");
	});
	
	readText("Please say " + GLOB_speak_message, function() {});
	
	setTimeout(function() {
		tim = setTimeout(function() {
			audio.abort();
			console.error("Time out on audio");
			getTextSentiment(GLOB_speak_message);
		}, 5000);
		
		audio.listen();
		
		//gyro.listen(function() {
		//	gyro.remove();
		//	audio.abort();
		//});
	}, 2000);
}

function getTextSentiment(user_message) {
	var MaxDistance = Math.max(user_message.length, GLOB_speak_message.length);
	var distance = dziemba_levenshtein(user_message, GLOB_speak_message);
	if (distance == 0) {
		GLOB_text_sentiment = 1.0;
	} else {
		GLOB_text_sentiment = 1 - (distance / MaxDistance);
	}
	handleConsent();
	/*
	$.ajax({
		url: '/text_sentiment?str=' + encodeURIComponent(user_message),
		type: 'GET',
		timeout:10000,
		success: function(data, textStatus, jqXHR){
			GLOB_text_sentiment = data.value;
			handleConsent();
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
			alert(errorThrown);
			$(".glh_page_5, .glh_page_0").toggleClass("glh_show");
		}
	});
	*/
}

function handleConsent() {
	$(".glh_page_5, .glh_page_6").toggleClass("glh_show");
	$.ajax({
		url: '/submitConsent?user=' + encodeURIComponent(GLOB_user) +
				            '&other_user=' + encodeURIComponent(GLOB_other_user) + 
					        '&message=' + encodeURIComponent(GLOB_consent_message) + 
					        '&lat=' + encodeURIComponent(GLOB_latitude) + 
					        "&long=" + encodeURIComponent(GLOB_longitude) + 
					        "&smile=" + encodeURIComponent(GLOB_smile) + 
							"&age=" + encodeURIComponent(GLOB_age) + 
							"&gender=" + encodeURIComponent(GLOB_gender) + 
							"&glasses=" + encodeURIComponent(GLOB_glasses) + 
							"&emotion=" + encodeURIComponent(JSON.stringify(GLOB_emotion)) + 
					        "&text_sentiment=" + encodeURIComponent(GLOB_text_sentiment),
		type: 'GET',
		success: function(data, textStatus, jqXHR){
			$(".glh_page_6, .glh_page_7").toggleClass("glh_show");
			gyro.remove();
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
			alert(errorThrown);
			$(".glh_page_6, .glh_page_0").toggleClass("glh_show");
		}
	});	
}