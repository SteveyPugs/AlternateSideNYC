var page = window.location.href;
var data;
if (page.indexOf("localhost") == -1)
{dataLink = "http://api.alternatesidenyc.com";}
else
{dataLink = "http://localhost:8080";}


//Javascript Code

var days = ['Sun','Mon','Tue','Wed','Thur','Fri','Sat'];
var month = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var abbrmonth = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var htmlTable;
var todaysStatus;
var weatherArray = new Array();
var streetNumber;
var road;
var roadwithth;
var town;
var state;
var zipcode;
var streetSign1;
var streetSign2;
var map;

//Gets Weather
$.ajax({
	 type: "GET",
	 url: dataLink + "/GetWeather",
	 dataType: "text",
	 async:false,
	 }).done(function(data) { 
	var json = JSON.parse(data);
	//console.log(json);
	var length = json.forecast.simpleforecast.forecastday.length;
	for(var x = 1; x <= length-1; x++)
	{	
	weatherArray[x-1] = new Array(3);
	weatherArray[x-1][0] = json.forecast.simpleforecast.forecastday[x].high.fahrenheit;
	weatherArray[x-1][1] = json.forecast.simpleforecast.forecastday[x].low.fahrenheit;
	weatherArray[x-1][2] = json.forecast.simpleforecast.forecastday[x].icon_url;
	}		
});

//Gets Full Forecast
$.ajax({
	type: "GET",
	url: dataLink + "/GetForecast",
	dataType: "json"
	}).done(function(data) {
		var json = data;
		var currentDate;
		var currentStatus;
		
		var avgHigh = 0;
		var avgLow = 0;
		todaysStatus = json[0].ForecastStatus;
		htmlTable = '<table style="border-collapse: collapse; width:100%;">';
		for(var x = 0; x <= 10; x++)
		{	
			currentDate = new Date(json[x].ForecastDate)
			if(x == 0)
			{
				$('#mth').text(month[currentDate.getMonth()]);
				$('#day').text(currentDate.getDate());
				if (json[x].ForecastStatus == 1)
				{$('#ASPStatus').text('Alternate Side Parking Is Not In Effect').addClass("status-red");}
				else
				{$('#ASPStatus').text('Alternate Side Parking Is In Effect').addClass("status-green");}
			}
			else
			{
			
				htmlTable = htmlTable + '<tr class="calTop">';
				htmlTable = htmlTable + '<td class="calRows">' + days[currentDate.getDay()] + ', ' + abbrmonth[currentDate.getMonth()] + ' ' + currentDate.getDate() + '</td>';
				
				if (x != 10)
				{
				avgHigh = avgHigh + parseInt(weatherArray[x-1][0]);
				avgLow = avgLow + parseInt(weatherArray[x-1][1]);
				htmlTable = htmlTable + '<td class="calRows">' + weatherArray[x-1][0] + '/' + weatherArray[x-1][1] + '&nbsp;&nbsp;&nbsp;' + '<img align=top width=24 height=24 src="' + weatherArray[x-1][2] + '" /></td>';
				}
				else
				{
				htmlTable = htmlTable + '<td class="calRows">' + parseInt(avgHigh/9) + '/' + parseInt(avgLow/9) + '&nbsp;&nbsp;&nbsp;<img align=top width=24 height=24 src="http://icons-ak.wxug.com/i/c/k/cloudy.gif" /></td>';
				}
								
				currentStatus = json[x].ForecastStatus;
				htmlTable = htmlTable + '<td class="calRows" style="text-align:center;';
				if (currentStatus == 0)
				{
					htmlTable = htmlTable + 'color:#2ecc71" align="center">YES ';
				}
				else
				{
					htmlTable = htmlTable + 'color:#c0392b" align="center">NO ';
				}	
				htmlTable = htmlTable + '</td>';
				htmlTable = htmlTable + '</tr>';
			}
			
		}
		htmlTable = htmlTable + '</table>';
		$('#Cal').html(htmlTable);
	});

//Gets Cancel Dates
$.ajax({
	 type: "GET",
	 url: dataLink + "/GetCancelDates",
	 dataType: "json"
	 }).done(function(data) {
	 var json = data;
	 htmlTable = '';
	 var todaysDate = new Date();
	 for(var x = 1; x <= json.length-1; x++)
	 {	
		checkDate = new Date(json[x].AlternateSideNYCCancelDate);
						
		if (checkDate >= todaysDate)
		{
			htmlTable = htmlTable + '<div class="innerFuture" >' + json[x].AlternateSideNYCCancelName + '<br>' + month[checkDate.getMonth()] + ' ' + checkDate.getDate() + ', ' + checkDate.getFullYear() +  '<br>' + '</div>';
		}
	}
	$('#FutureDays').html(htmlTable);
 });

 
$('#GoToTop').click(function(){
	$("html, body").animate({ scrollTop: 0 }, 300);
});

$('#locateme').click(function(){
	$("html, body").animate({ scrollTop: $(document).height()-$(window).height() },300);
});

$('#CloseWindow').click(function(){
	$("#SMS").fadeOut("fast");
});

$('#OpenWindow').click(function(){
	$("#SMS").fadeIn("fast");
	$('#error').hide();
});

$('#SendSMS').click(function(){
	var telNumber = document.getElementById('TelNumber').value;

	if (telNumber == '')
	{
		$('#error').show();
	}
	else
	{
		$('#error').hide();
		$.get(dataLink +  '/SendSMS/' + telNumber + '/' + todaysStatus, function(data) {
		  if (data.indexOf("SMS Sent") != -1)
		  {
			$("#SMS").fadeOut("fast");
			alert("SMS Successfully Sent! Thanks for using the SMS Service!")
		  }
		});		
	}
});


function initialize() {
  var mapOptions = {
    zoom: 17,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
	mapTypeControl: false,
	draggable: false,
	scaleControl: false,
	scrollwheel: false,
	navigationControl: false,
	streetViewControl: false,
	panControl: false,
	zoomControl: false,
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);
//Get Address From Position
$.ajax({
	 type: "GET",
	 url: "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude + "&sensor=true",
	 dataType: "json"
	 }).done(function(data) {
	 for(var x = 0; x <= data.results.length - 1; x++)
	 {
		 for(var y = 0; y <= data.results[x].types.length - 1; y++)
		 {
			if (data.results[x].types[y] == 'street_address')
			{
				for(var z = 0; z <= data.results[x].address_components.length - 1; z++)
				{
					if (data.results[x].address_components[z].types[0] == 'street_number')
					{
						streetNumber = data.results[x].address_components[z].long_name;
						var count = streetNumber.match(/-/g);  
						if (count.length > 1)
						{
							streetNumber = streetNumber.substring(0, streetNumber.indexOf("-",0)) + "-0"
						}
						//console.log(streetNumber);
					}
					
					if (data.results[x].address_components[z].types[0] == 'route')
					{
						road = data.results[x].address_components[z].long_name;
						
						if (road.indexOf("maspeth") == -1)
						{
							road = road.replace("th","");
						}
						
						
					}
					
					if (data.results[x].address_components[z].types[0] == 'sublocality')
					{town = data.results[x].address_components[z].long_name;}
					
					if (data.results[x].address_components[z].types[0] == 'locality')
					{state = data.results[x].address_components[z].long_name;}
					
					if (data.results[x].address_components[z].types[0] == 'postal_code')
					{zipcode = data.results[x].address_components[z].long_name;}
				}
			}
		 }
	 } 	 
	$.ajax({
		 type: "GET",
		 url:  dataLink + "/GetAlternateSideSigns/" + town + "/" + road + "/"  + streetNumber,
		 dataType: "json"
		 }).done(function(signsData){
		 if (signsData.length != 0)
		 {
			 
			 if (!signsData[0].SignDetails)
			 {$('#Alt1').html("No Sign Data Available");}
			 else
			 {$('#Alt1').html(signsData[0].SignDetails + " - SIDE: " + signsData[0].SideOfBlock);}
			 
			 if (!signsData[1].SignDetails)
			 {$('#Alt2').html("No Sign Data Available");}
			 else
			 {$('#Alt2').html(signsData[1].SignDetails + " - SIDE: " + signsData[1].SideOfBlock);}
		 }
		 else
		 {
			$('#Alt1').html("No Sign Data Available");
			$('#Alt2').html("No Sign Data Available");
		 }
	});
	});
   
	  var marker = new google.maps.Marker({
      position: pos,
      map: map,
  });
	  

      map.setCenter(pos);
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }
}

function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(60, 105),
    content: content,
	
  };

  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
}

google.maps.event.addDomListener(window, 'load', initialize);