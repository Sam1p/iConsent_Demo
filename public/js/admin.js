$.ajax({
	url: '/getConsent',
	type: 'GET',
	success: function(data, textStatus, jqXHR){
		showConsent(data);
	},
	error: function(XMLHttpRequest, textStatus, errorThrown){
		alert(errorThrown);
	}
});

function showConsent(data) {

	var progresses = $("progress");
	data.emotion = JSON.parse(data.emotion);
	progresses.eq(0).val(data.emotion.anger);
	progresses.eq(1).val(data.emotion.contempt);
	progresses.eq(2).val(data.emotion.disgust);
	progresses.eq(3).val(data.emotion.fear);
	progresses.eq(4).val(data.emotion.happiness);
	progresses.eq(5).val(data.emotion.neutral);
	progresses.eq(6).val(data.emotion.sadness);
	progresses.eq(7).val(data.emotion.surprise);
	
	//data.smile = parseFloat(data.smile);
	$(".glh_smile_icon").hide();
	if (data.smile > 0.66) {
		$(".glh_smile_icon").eq(2).show();
	} else if (data.smile > 0.33) {
		$(".glh_smile_icon").eq(1).show();
	} else {
		$(".glh_smile_icon").eq(0).show();
	}

	//data.text_sentiment = parseFloat(data.text_sentiment);
	$(".glh_speech_icon").hide();
	if (data.text_sentiment > 0.5) {
		$(".glh_speech_icon").eq(1).show();
	} else {
		$(".glh_speech_icon").eq(0).show();
	}

	document.getElementById("user_1").innerHTML = data.user;
	document.getElementById("user_2").innerHTML = data.other_user;
	document.getElementById("message").innerHTML = data.message;
	document.getElementById("latitude").innerHTML = data.lat;
	document.getElementById("longitude").innerHTML = data.long;
	//document.getElementById("smile").innerHTML = data.smile;
	document.getElementById("age").innerHTML = data.age;
	document.getElementById("gender").innerHTML = data.gender;
	document.getElementById("glasses").innerHTML = data.glasses;
	//document.getElementById("emotion").innerHTML = data.emotion;
	//document.getElementById("text_sentiment").innerHTML = data.text_sentiment;

	$('#gm-map').gmap3({
		center: [data.lat, data.long],
		zoom: 16,
		mapTypeId : google.maps.MapTypeId.ROADMAP
	}).marker([
		{position:[data.lat, data.long]}
	]);
}