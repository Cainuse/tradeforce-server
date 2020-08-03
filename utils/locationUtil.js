const axios = require("axios");
const getLocationByPostalCode = async (postalCode) => {
  const url =
    "https://maps.googleapis.com/maps/api/geocode/json?address=" +
    postalCode +
    "&key=" +
    process.env.GOOGLE_MAPS_API_ACCESS_KEY;

  const response = await axios.get(url);

  const body = response.data;

  if (body.results.length <= 0) {
    throw "No results found";
  }

  const locationObject = {
    location: getLocation(body.results[0]),
    lat: body.results[0].geometry.location.lat,
    lon: body.results[0].geometry.location.lng,
  };

  return locationObject;
};

function getLocation(loc) {
  let components = loc.address_components;
  let ret = "";

  components.forEach((component) => {
    if (component.types.includes("neighborhood")) {
      ret += component.long_name + " | ";
    }
  });

  components.forEach((component) => {
    if (component.types.includes("locality")) {
      ret += component.long_name;
    }
  });

  components.forEach((component) => {
    if (component.types.includes("administrative_area_level_1")) {
      ret += ", " + component.short_name;
    }
  });

  return ret;
}

const getDistance = (lat1, lat2, lon1, lon2, unit) => {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
      dist = dist * 1.609344;
    }
    if (unit == "N") {
      dist = dist * 0.8684;
    }
    return dist;
  }
};

module.exports = {
  getLocationByPostalCode: getLocationByPostalCode,
  getDistance: getDistance,
};
