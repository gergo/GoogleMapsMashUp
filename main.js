var map;
var infowindow;
var markers = [];
var service;

function initialize() {
	var bp = new google.maps.LatLng(BP_LATITUDE, BP_LONGITUDE);

	map = new google.maps.Map(document.getElementById('map-canvas'), {
		center : bp,
		zoom : 13
	});

	infowindow = new google.maps.InfoWindow();
	service = new google.maps.places.PlacesService(map);

	google.maps.event.addListener(map, 'idle', function() {
		sendRequests();
	});
}

function sendRequests() {
	for ( var i = 0; i < markers.length; ++i) {
		markers[i].setMap(null);
	}
	markers = [];

	var bounds = map.getBounds();
	var ne = bounds.getNorthEast();
	var sw = bounds.getSouthWest();
	var nw = new google.maps.LatLng(ne.lat(), sw.lng());
	var x = google.maps.geometry.spherical.computeDistanceBetween(ne, nw);
	var y = google.maps.geometry.spherical.computeDistanceBetween(sw, nw);
	var radius = Math.min(x, y) / 2;

	var bp = map.getCenter();
	var req = request(bp, radius, 'restaurant');
	service.nearbySearch(req, callback);
	var req1 = request(bp, radius, 'lodging');
	service.nearbySearch(req1, callback);
	var req2 = request(bp, radius, 'bus_station');
	service.nearbySearch(req2, callback);
}

function request(latLng, radius, type) {
	var request = {
		location : latLng,
		radius : radius,
		types : [ type ]
	};
	return request;
}

function callback(results, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		for ( var i = 0; i < results.length; i++) {
			createMarker(results[i]);
		}
	}
}

function createMarker(place) {
	var marker = new google.maps.Marker({
		map : map,
		position : place.geometry.location,
		icon : getIcon(place)
	});
	markers.push(marker);
	google.maps.event.addListener(marker, 'click', function() {
		var req = {
			reference : place.reference
		};
		service.getDetails(req, function(details, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				infowindow.setContent('<b>' + details.name + '</b>' + '<br>'
						+ details.formatted_address
						+ getReviewText(details.reviews));
				infowindow.open(map, marker);
			}
		});
	});
}

google.maps.event.addDomListener(window, 'load', initialize);
