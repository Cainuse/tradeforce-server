const request = require("request");

const getLocationByPostalCode = (postalCode) => {
  request(
    "https://maps.googleapis.com/maps/api/geocode/json?address=" +
      postalCode +
      "&key=" +
      process.env.GOOGLE_MAPS_API_ACCESS_KEY,
    { json: true },
    (err, res, body) => {
      if (err) {
        return console.log(err);
      }
      const locationObject = {
        location: getLocation(body.results[0]),
        lat: body.results[0].geometry.location.lat,
        lon: body.results[0].geometry.location.lng,
      };
    }
  );
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
      break;
    }
  });

  components.forEach((component) => {
    if (component.types.includes("administrative_area_level_1")) {
      ret += ", " + component.short_name;
      break;
    }
  });

  return ret;
}

const getDistance = (lat1, lat2, lon1, lon2) => {};

module.exports = getLocationByPostalCode;
