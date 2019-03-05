var myLat = 0;
var myLng = 0;
var me = new google.maps.LatLng(myLat, myLng);
var myOptions = {
    zoom: 13, // The larger the zoom number, the bigger the zoom
    center: me,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
          ]
};
var map;
var marker;
ridesLatLng = [];
weinerLatLng = [];
var icons = 
{
    self :{
        icon: 'betty_icon.jpg'
    },
    passenger: {
        icon: 'passenger.png'
    },
    vehicle: {
        icon: 'car.png'
    },
    weinermobile: {
        icon: 'weinermobile.png'
    }
};        
var clients;
var infowindow = new google.maps.InfoWindow();

function init() {
    console.log("Begin");
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    getMyLocation();
};

function getMyLocation() {
    if (navigator.geolocation) { // the navigator.geolocation object is supported on your browser
        navigator.geolocation.getCurrentPosition(function(position) {
            myLat = position.coords.latitude;
            myLng = position.coords.longitude;
            renderMap();
        });
    }
    else {
        alert("Geolocation is not supported by your web browser")
        }
};

function renderMap() {
    me = new google.maps.LatLng(myLat, myLng);
    // Update map and go there...
    map.panTo(me);
                
    // Create a marker
    marker = new google.maps.Marker({
        position: me,
        title: "Here I Am!",
        icon: 'betty_icon.jpg'
    });
    marker.setMap(map);
                    
    // Open info window on click of marker
    getRides();
    //constructInfoWindow();
};

//var weinermobile = false;
var request = new XMLHttpRequest();
function getRides(){
    request.open("POST", "https://hans-moleman.herokuapp.com/rides", true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            console.log("Retrieved data!");
            data = request.responseText;
            console.log(data);
            rides = JSON.parse(data);
            if (rides.hasOwnProperty("vehicles")){
                console.log("vehicle mode");
                clients = rides.vehicles;
                for (count = 0; count< clients.length; count++){
                    if (clients[count].username == "WEINERMOBILE"){
                        weiner_exists = true;
                        //console.log("weiner found");
                        makeWeinerMarker(clients[count]);
                    }
                    else {
                        makeCarMarker(clients[count]);
                    }
                }
                constructInfoWindow("vehicle");
            }
            else { //passengers 
                console.log(mode);
                clients = rides.passengers;
                for (count = 0; count< clients.length; count++){
                    if (clients[count].username == "WEINERMOBILE"){
                        weiner_exists = true;
                        //console.log("weiner found");
                        makeWeinerMarker(clients[count]);
                    }
                    else{
                        makePassengerMarker(clients[count]);
                    }
                }
                constructInfoWindow("passenger");
            }
        }
        else if (request.readyState==4 && request.status != 200){
            console.log("Something went wrong!");
        }
        else {
            console.log("In progress");
        }
    };
    request.send("username=j3YRjYyc&lat=" + myLat + "&lng=" + myLng);
};

function makeWeinerMarker(vehicle)
{
    var latLng = new google.maps.LatLng(vehicle.lat, vehicle.lng);
    console.log("making weiner");
    var weinerMarker = new google.maps.Marker({
        position: latLng,
        title: vehicle._id,
        //icon should be either weinermobile or car, depending on the data
        icon: 'weinermobile.png'
    })
    weinerMarker.setMap(map);
    weinerLatLng.push(latLng);
    var dist = toMiles(google.maps.geometry.spherical.computeDistanceBetween(me, latLng));
    google.maps.event.addListener(weinerMarker, 'click', function()
    {
        infowindow.setContent(vehicle.username+" is "+dist+" miles away from you.")
        infowindow.open(map, weinerMarker);
    });
};

function makeCarMarker(vehicle)
{
    var latLng = new google.maps.LatLng(vehicle.lat, vehicle.lng);
    console.log("making car");
    var carMarker = new google.maps.Marker({
        position: latLng,
        title: vehicle._id,
        //icon should be either weinermobile or car, depending on the data
        icon: 'car.png' //'car.png'
    })
    carMarker.setMap(map);
    ridesLatLng.push(latLng);
    var dist = toMiles(google.maps.geometry.spherical.computeDistanceBetween(me, latLng));
    google.maps.event.addListener(carMarker, 'click', function()
    {
        infowindow.setContent(vehicle.username+" is "+dist+" miles away from you.")
        infowindow.open(map, carMarker);
    });
};

function makePassengerMarker(pass)
{
    var latLng = new google.maps.LatLng(pass.lat, pass.lng);
    var passengerMarker = new google.maps.Marker({
        position: latLng,
        title: pass._id,
        //icon should be either weinermobile or car, depending on the data
        icon: 'passenger.png'
    })
    passengerMarker.setMap(map);
    ridesLatLng.push(latLng);
    var dist = toMiles(google.maps.geometry.spherical.computeDistanceBetween(me, latLng));
    google.maps.event.addListener(passengerMarker, 'click', function()
    {
        infowindow.setContent(pass.username+" is "+dist+" miles away from you.")
        infowindow.open(map, passengerMarker);
    });
};

function constructInfoWindow(mode)
{
    google.maps.event.addListener(marker, 'click', function() {
        console.log("constructInfoWindow");
        if (ridesLatLng.length > 0){
            var dist = getNearestVehicle();
            if (weinerLatLng.length >0)
            {
                var w_dist = getWeinerDist();
                infowindow.setContent("Hello, j3YRjYyc. The nearest "+mode+" is "+dist+" miles away. The weinermobile is "+w_dist+"miles away.");
            }
            else{
                infowindow.setContent("Hello, j3YRjYyc. The nearest "+mode+" is "+dist+" miles away. There is no weinermobile!")
            }
        }
        else if (weinerLatLng.length>0)
        {
            var w_dist = getWeinerDist();
            infowindow.setContent("Hello, j3YRjYyc. The weinermobile is "+w_dist +" miles away.");
        }
        else 
        {
            infowindow.setContent("Hello, j3YRjYyc. No clients or weinermobile around!");
        }   
        infowindow.open(map, marker);
    });
};

function getNearestVehicle()
{
    var dist = Number.MAX_VALUE;
    for (count = 0; count<ridesLatLng.length; count++){
        var temp = toMiles(google.maps.geometry.spherical.computeDistanceBetween(me, ridesLatLng[count]));
        if (temp < dist){
            console.log("temp is "+temp);
            dist = temp;
        }
    }
    console.log(" vehicle dist = "+ dist);
    return dist;
};

function getWeinerDist()
{
    dist = toMiles(google.maps.geometry.spherical.computeDistanceBetween(me, weinerLatLng[0]));
    console.log("weiner dist "+ dist);
    return dist;
};

function toMiles(dist)
{
    return (0.000621371192 * dist).toFixed(2);
};
            