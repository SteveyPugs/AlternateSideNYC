var weatherArray = new Array()
$.ajax({
  url: "http://api.alternatesidenyc.com/WeatherForecast",
  async:false,
  success: function(reply){
    var length = reply.forecast.simpleforecast.forecastday.length
    for(var x = 1; x <= length-1; x++){
      weatherArray[x-1] = new Array(3)
      weatherArray[x-1][0] = reply.forecast.simpleforecast.forecastday[x].high.fahrenheit
      weatherArray[x-1][1] = reply.forecast.simpleforecast.forecastday[x].low.fahrenheit
      weatherArray[x-1][2] = reply.forecast.simpleforecast.forecastday[x].icon_url
    }
  }
})


$('#month').text(moment().format("MMMM"))
$('#day').text(moment().format("Do"))
$('#year').text(moment().format("YYYY"))
$('#month').addClass("text-center")
$('#day').addClass("text-center")
$('#year').addClass("text-center")

var todaysStatusLink = "http://api.alternatesidenyc.com/Dates/"+moment().format("YYYY")+"/"+moment().format("MM")+"/"+moment().format("DD")+""
$.get(todaysStatusLink, function(reply) {
  if (typeof reply == "object" && jQuery.isEmptyObject(reply) == true) {
    $('#status').text("Alternate Side Parking is in Effect Today")
    $('#status').css("color","green")
    $('#status').addClass("text-center")
  }
  else{
    $('#status').text("Alternate Side Parking is not in Effect Today")
    $('#status').css("color","red")
    $('#status').addClass("text-center")
  }        
})



var strSchedule = ""
strSchedule = strSchedule + "<table width='100%'>"
strSchedule = strSchedule + "<thead>"
strSchedule = strSchedule + "<tr>"
strSchedule = strSchedule + "<th class='text-center' style='width:33%'><h5><b>Date</b></h5></th>"
strSchedule = strSchedule + "<th class='text-center' style='width:33%'><h5><b>Weather</b></h5></th>"
strSchedule = strSchedule + "<th class='text-center' style='width:33%'><h5><b>Status</b></h5></th>"
strSchedule = strSchedule + "</tr>"
strSchedule = strSchedule + "</thead>"
for (var i = 1; i < 10; i++) {
  strSchedule = strSchedule + "<tr>"
  strSchedule = strSchedule + "<td>"
  strSchedule = strSchedule + "<h6 class='text-center'>" + moment().add('days', i).format("MMM")+" "+moment().add('days', i).format("DD") + "</h6>"
  strSchedule = strSchedule + "</td>"
  strSchedule = strSchedule + "<td>"
  strSchedule = strSchedule + "<h6 class='text-center'>" + weatherArray[i-1][0] + "/" + weatherArray[i-1][1] + "<br><img src=" + weatherArray[i-1][2] + " width='25' class='text-center' /></h6>"
  strSchedule = strSchedule + "</td>"
  strSchedule = strSchedule + "<td>"
  $.ajax({
    url: "http://api.alternatesidenyc.com/Dates/"+moment().add('days', i).format("YYYY")+"/"+moment().add('days', i).format("MM")+"/"+moment().add('days', i).format("DD")+"",
    async:false,
    success: function(reply) {
      if (typeof reply == "object" && jQuery.isEmptyObject(reply) == true) {
        strSchedule = strSchedule + "<h6 class='text-center' style='color:green'>YES</h6>"
      }
      else{
        strSchedule = strSchedule + "<h6 class='text-center' style='color:red'>NO</h6>"
      }
    }      
  })
  strSchedule = strSchedule + "</td>"
  strSchedule = strSchedule + "</tr>"
}
strSchedule = strSchedule + "</table>"
$('#schedule').html(strSchedule)


$.ajax({
    url: "http://api.alternatesidenyc.com/Dates",
    async:true,
    success: function(reply) {
      var list = ""
      list = list + "<table width='100%'>"
      list = list + "<thead>"
      list = list + "<tr>"
      list = list + "<th class='text-center' colspan='3'><h5><b>Future Cancelation Dates</b></h5></th>"
      list = list + "</tr>"
      list = list + "</thead>"
      var innerCounter = 1
      for (var i = 1; i < reply.length; i++){
        var isBefore = moment(moment(reply[i].CancelDate).add('days', 1).format('MM/DD/YYYY')).isBefore(moment().format('YYYY-MM-DD'))
        if (!isBefore){
          
          if (innerCounter == 1 && i <= reply.length){
            list = list + "<tr><td style='padding:5px;width:33%' valign='top'><h6><b>"+reply[i].CancelName+"</b></h6><h6><em>"+moment(reply[i].CancelDate).add('days', 1).format('dddd MMMM Do, YYYY')+"</em></h6></td>"
            innerCounter = innerCounter + 1
            continue
          }

          if (innerCounter == 2 && i <= reply.length){
            list = list + "<td style='padding:5px;width:33%' valign='top'><h6><b>"+reply[i].CancelName+"</b></h6><h6><em>"+moment(reply[i].CancelDate).add('days', 1).format('dddd MMMM Do, YYYY')+"</em></h6></td></tr>"
            innerCounter = 1
            continue
          }
        }
      }
      list = list + "</table>"
      $('#list').html(list)
    }
  })


//seperate section for the maps
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
  }
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,position.coords.longitude)

      $.ajax({
        url: "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude + "&sensor=true",
        async:true,
        success: function(reply){
          for(var x = 0; x <= reply.results.length - 1; x++){
            for(var y = 0; y <= reply.results[x].types.length - 1; y++){
              if (reply.results[x].types[y] == 'street_address'){
                for(var z = 0; z <= reply.results[x].address_components.length - 1; z++){
                  if (reply.results[x].address_components[z].types[0] == 'street_number'){
                    streetNumber = reply.results[x].address_components[z].long_name
                    var count = streetNumber.match(/-/g)
                    if (count != null && count.length > 1){
                      streetNumber = streetNumber.substring(0, streetNumber.indexOf("-",0)) + "-0"
                    }
                  }

                  if (reply.results[x].address_components[z].types[0] == 'route'){
                    road = reply.results[x].address_components[z].long_name
                    if ((road.indexOf("maspeth") == -1) || (road.indexOf("north") == -1) || (road.indexOf("south") == -1)){
                      road = road.replace("th","")
                    }
                  }

                  if (reply.results[x].address_components[z].types[0] == 'sublocality'){
                    town = reply.results[x].address_components[z].long_name
                  }

                  if (reply.results[x].address_components[z].types[0] == 'locality'){
                    state = reply.results[x].address_components[z].long_name
                  }

                  if (reply.results[x].address_components[z].types[0] == 'postal_code'){
                    zipcode = reply.results[x].address_components[z].long_name
                  }
                }
              }
            }
          }

          $.ajax({
            url: "http://api.alternatesidenyc.com/Signs/" + town + "/" + road + "/"  + streetNumber,
            async:false,
            success: function(reply){
              if (reply.length != 0){
                if (!reply[0].SignDetails){
                  $('#Sign1').html("No Sign Data Available")
                }
                else{
                  $('#Sign1').html(reply[0].SignDetails + " - SIDE: " + reply[0].SideOfBlock)
                }

                if (!reply[1].SignDetails){
                  $('#Sign2').html("No Sign Data Available")
                }
                else{
                  $('#Sign2').html(reply[1].SignDetails + " - SIDE: " + reply[1].SideOfBlock)
                }
              }
              else{
              $('#Sign1').html("No Sign Data Available")
              $('#Sign2').html("No Sign Data Available")
              }
            }
          })
        }
      })

      var marker = new google.maps.Marker({position: pos,map: map})
      map.setCenter(pos)
    }, function() {
      handleNoGeolocation(true)
    })
  }
  else{
    handleNoGeolocation(false)
  }
}

function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.'
  }
  else {
    var content = 'Error: Your browser doesn\'t support geolocation.'
  }
  var options = {map: map, position: new google.maps.LatLng(60, 105), content: content}
  var infowindow = new google.maps.InfoWindow(options)
  map.setCenter(options.position)
}

google.maps.event.addDomListener(window, 'load', initialize)