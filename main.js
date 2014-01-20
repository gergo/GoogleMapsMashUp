var map;
var infowindow;
var service;

var hotels = [];
var bus_stops = [];
var restaurants = [];

// entry point
function initialize() {
	var initialMapCenter = new google.maps.LatLng(BP_LATITUDE, BP_LONGITUDE);

	// initialize global variables
	map = new google.maps.Map(document.getElementById('map-canvas'), {
		center : initialMapCenter,
		zoom : 13
	});
	infowindow = new google.maps.InfoWindow();
	service = new google.maps.places.PlacesService(map);

	// redraw markers whenever the map changes, ie. becomes 'idle'
	google.maps.event.addListener(map, 'idle', function() {
		sendRequests();
	});
}

function sendRequests() {
	hotels = removeUnseenMarkers(hotels, map.getBounds());
	bus_stops = removeUnseenMarkers(bus_stops, map.getBounds());
	restaurants = removeUnseenMarkers(restaurants, map.getBounds());

	var searchRadius = getSearchRadius(map.getBounds());
	var searchCenter = map.getCenter();

	var restaurantRequest = request(searchCenter, searchRadius, 'restaurant');
	var hotelRequest = request(searchCenter, searchRadius, 'lodging');
	var busRequest = request(searchCenter, searchRadius, 'bus_station');

	service.nearbySearch(restaurantRequest, function(results, status) {
		createMarkers(results, status, restaurants);
	});
	service.nearbySearch(hotelRequest, function(results, status) {
		createMarkers(results, status, hotels);
	});
	service.nearbySearch(busRequest, function(results, status) {
		createMarkers(results, status, bus_stops);
	});
}

function createMarkers(results, status, existingMarkers) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		for ( var i = 0; i < results.length; ++i) {
			if (existingMarkers.length < 20) {
				createMarker(results[i], existingMarkers);
			}
		}
	}
}

function createMarker(place, existingMarkers) {	
	var loc = place.geometry.location;
	var containsMarker = false;
	for (var i = 0; i < existingMarkers.length; ++i) {
		if (existingMarkers[i].position.equals(loc)) {
			containsMarker = true;
			break;
		}
	}
	
	if (!containsMarker) {
		var marker = new google.maps.Marker({
			map : map,
			position : place.geometry.location,
			animation : google.maps.Animation.DROP,
			icon : getIcon(place)
		});
		
		// store marker object so we can remove it if the map changes
		existingMarkers.push(marker);

		google.maps.event.addListener(marker, 'click', function() {
			onMarkerClicked(place, marker);
		});
	}
}

function onMarkerClicked(place, marker) {
	var locationDetailsRequest = {
		reference : place.reference
	};
	service.getDetails(locationDetailsRequest, function(locationDetails, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			// simple info window for bus stations
			if (isInArray(locationDetails.types, 'bus_station')) {
				infowindow.setContent(getBasicLocationInfo(locationDetails));
				infowindow.open(map, marker);
			} else {
				doAdditionalRadarSearch(place, marker, locationDetails);
			}
		}
	});
}

// for hotels and restaurants we need to show a link to the nearest bus stop
// on the info window along with basic location details
function doAdditionalRadarSearch(place, marker, locationDetails) {
	var busStationSearchRequest = {
		bounds : map.getBounds(),
		types : [ 'bus_station' ]
	};
	service.radarSearch(busStationSearchRequest, function(busStations, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			var closestBusStop = findClosestLocation(place, busStations);
			if (closestBusStop == undefined) {
				infowindow.setContent(getBasicLocationInfo(details));
				infowindow.open(map, marker);
			} else {
				getBusStopDetails(locationDetails, closestBusStop, marker);
			}
		}
	});
}

function getBusStopDetails(locationDetails, busStop, marker) {
	var req = {
		reference : busStop.reference
	};
	service.getDetails(req, function(busStopDetails, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			infowindow.setContent(getBusStopDetailsInfo(locationDetails,
					busStopDetails));
			infowindow.open(map, marker);
		}
	});
}

function moveMapTo(latitude, longitude) {
	var newCenter = new google.maps.LatLng(latitude, longitude);
	map.panTo(newCenter);
}

google.maps.event.addDomListener(window, 'load', initialize);
