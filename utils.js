// Initialize map to Kalvin ter, Budapest
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

// check if an element is in an array
function isInArray(array, element) {
	return array.indexOf(element) >= 0;
}

// return the first review if they are available
function getReviewText(reviews) {
	if (reviews == undefined || reviews[0] == undefined) {
		return "";
	}
	var invalidUrl = reviews[0].author_url == undefined;
	return "<br>"
			+ (invalidUrl ? "" : "<a href='" + reviews[0].author_url
					+ "' target='_blank'>") + reviews[0].author_name
			+ (invalidUrl ? "" : "</a>") + ": " + reviews[0].text;
}