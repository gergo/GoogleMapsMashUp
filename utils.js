// Initialize map to these values: Kalvin ter, Budapest
var BP_LATITUDE = 47.4896944;
var BP_LONGITUDE = 19.0618194;

// get custom icon for places of interest based on their type
function getIcon(place) {
	if (isInArray(place.types, 'restaurant')) {
		return 'icons/restaurant.png';
	} else if (isInArray(place.types, 'lodging')) {
		return 'icons/lodging.png';
	} else if (isInArray(place.types, 'bus_station')) {
		return 'icons/bus.png';
	}
}

function isInArray(array, element) {
	return array.indexOf(element) >= 0;
}

function getBusStopDetailsInfo(locationDetails, busStopDetails) {
	return getBasicLocationInfo(locationDetails) + "<br>closest bus station: "
			+ "<a href='javascript:moveMapTo("
			+ busStopDetails.geometry.location.d + ","
			+ busStopDetails.geometry.location.e + ");'>" + busStopDetails.name
			+ "</a>";
}

function getBasicLocationInfo(details) {
	return "<b>" + details.name + "</b>" + "<br>" + details.formatted_address
			+ getReviewText(details.reviews);
}

// return the first review if it is available
function getReviewText(reviews) {
	if (reviews == undefined || reviews[0] == undefined) {
		return "";
	}
	var invalidUrl = reviews[0].author_url == undefined;
	return "<br>" + (invalidUrl ? "" : "<a href='" + reviews[0].author_url
			+ "' target='_blank'>") + reviews[0].author_name
			+ (invalidUrl ? "" : "</a>") + ": " + reviews[0].text;
}

// remove existing markers. called whenever we change visible map
function deleteMarkers(markers) {
	for ( var i = 0; i < markers.length; ++i) {
		markers[i].setMap(null);
	}
	markers = [];
}

// find the closest location on a spherical surface from an array of points
// using the build-in google method, which uses the Haversine formula
function findClosestLocation(location, array) {
	var closestDistance = Number.MAX_VALUE;
	var closestId = -1;
	for ( var i = 0; i < array.length; ++i) {
		var distance = google.maps.geometry.spherical.computeDistanceBetween(
				location.geometry.location, array[i].geometry.location);
		if (distance < closestDistance) {
			closestDistance = distance;
			closestId = i;
		}
	}
	return array[closestId];
}

// search radius is based on the visible map's width and height. we take the
// smaller and divide it by 2.
function getSearchRadius(bounds) {
	var ne = bounds.getNorthEast();
	var sw = bounds.getSouthWest();
	var nw = new google.maps.LatLng(ne.lat(), sw.lng());
	var width = google.maps.geometry.spherical.computeDistanceBetween(ne, nw);
	var height = google.maps.geometry.spherical.computeDistanceBetween(sw, nw);
	return Math.min(width, height) / 2;
}

// create a request object for a single type
function request(searchCenter, searchRadius, type) {
	var request = {
		location : searchCenter,
		radius : searchRadius,
		types : [ type ]
	};
	return request;
}
