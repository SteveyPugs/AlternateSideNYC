var app = angular.module('AlternateSideNYC',[])

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

app.controller("todayController",function($scope,$http){
  $scope.month = moment().format("MMMM")
  $scope.day = moment().format("Do")
  $scope.daynum = moment().format("DD")
  $scope.year = moment().format("YYYY")
  var httpMethods = {
    method: "GET",
    url: "http://api.alternatesidenyc.com/Dates/" + $scope.year + "/" + $scope.month + "/" + $scope.daynum
  }
  $http(httpMethods).success(function(data, status, headers, config) {
    if (jQuery.isEmptyObject(data) == true){
      $("#status").css("color","green")
      $scope.status = "Alternate Side Parking is in Effect Today"
    }
    else{
      $("#status").css("color","red")
      $scope.status = "Alternate Side Parking is not in Effect Today"
    }
  })
})

app.controller("scheduleController",function($scope,$http){
  $scope.data = []
  for (var i = 0; i < 9; i++){
    row = {}
    row.date = moment().add('days', i+1).format("MMM") + " " + moment().add('days', i+1).format("DD")
    row.weatherText = weatherArray[i][0] + "/" + weatherArray[i][1]
    row.weatherPicture = weatherArray[i][2] 
    $.ajax({
      url: "http://api.alternatesidenyc.com/Dates/" + moment().add('days', i).format("YYYY") + "/" + moment().add('days', i).format("MM") + "/" + moment().add('days', i+1).format("DD"),
      async: false,
      success: function(reply){
        if (jQuery.isEmptyObject(reply) == true){
          row.dateStatus = "YES"
        }
        else{
          row.dateStatus = "NO"
        }
      }
    })
    $scope.data.push(row)
  }
})

app.controller("daysOffController",function($scope,$http){
  var httpMethods = {
    method: "GET",
    url: "http://api.alternatesidenyc.com/Dates"
  }
  $http(httpMethods).success(function(data, status, headers, config) {
    $scope.data = []
    var counter = 0;
    for (var i = 1; i < data.length; i++){
      var isBefore = moment(moment(data[i].CancelDate).add('days', 1).format('MM/DD/YYYY')).isBefore(moment().format('YYYY-MM-DD'))
      if (!isBefore){
        row = {}
        if (data[i] != undefined){
          row.col1a = data[i].CancelName
          row.col1b = moment(data[i].CancelDate).add('days', 1).format('dddd MMMM Do, YYYY')
        }
        if (data[i+1] != undefined){
          row.col2a = data[i+1].CancelName
          row.col2b = moment(data[i+1].CancelDate).add('days', 1).format('dddd MMMM Do, YYYY')
        }
        i = i + 1
        $scope.data.push(row)
      }
    }
  })
})

app.controller("mapController",function($scope,$http){
  function initialize(){
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
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions)
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(function(position){
        var pos = new google.maps.LatLng(position.coords.latitude,position.coords.longitude)

        var httpMethods = {
          method: "GET",
          url: "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude + "&sensor=true"
        }

        $http(httpMethods).success(function(data, status, headers, config) {
          //console.log(data)
          var street_address = data.results[0].address_components[0].long_name
          var count = street_address.match(/-/g)
          if (count != null && count.length > 1){
            street_address = street_address.substring(0, street_address.indexOf("-",0)) + "-0"
          }
          var road = data.results[0].address_components[1].long_name
          if ((road.indexOf("maspeth") == -1) || (road.indexOf("north") == -1) || (road.indexOf("south") == -1)){
            road = road.replace("th","")
          }
          var town = data.results[0].address_components[3].long_name
          var state = data.results[0].address_components[5].long_name
          var zipcode = data.results[0].address_components[7].long_name

          var httpMethods = {
            method: "GET",
            url: "http://api.alternatesidenyc.com/Signs/" + town + "/" + road + "/"  + street_address
          }
          $http(httpMethods).success(function(data, status, headers, config) {
            if (data.length > 0){
              if(data[0] != undefined){
                $scope.Sign1 = data[0].SignDetails
                $scope.Side1 = data[0].SideOfBlock
              }
              else{
                $scope.Sign1 = "NO SIGN AVAILABLE"
                $scope.Side1 = "N/A"
              }

              if(data[1] != undefined){
                $scope.Sign2 = data[1].SignDetails
                $scope.Side2 = data[1].SideOfBlock
              }
              else{
                $scope.Sign2 = "NO SIGN AVAILABLE"
                $scope.Side2 = "N/A"
              }
            }
            else{
              $scope.Sign1 = "NO SIGN AVAILABLE"
              $scope.Side1 = "N/A"
              $scope.Sign2 = "NO SIGN AVAILABLE"
              $scope.Side2 = "N/A"
            }
          })
        })
        
        var marker = new google.maps.Marker({position: pos,map: map})
        map.setCenter(pos)
      }, function(){
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
    else{
      var content = 'Error: Your browser doesn\'t support geolocation.'
    }
    var options = {map: map, position: new google.maps.LatLng(60, 105), content: content}
    var infowindow = new google.maps.InfoWindow(options)
    map.setCenter(options.position)
  }
  google.maps.event.addDomListener(window, 'load', initialize)
})