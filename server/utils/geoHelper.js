/**
 * Haversine formula – returns distance in km between two lat/lng points.
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Returns a SQL fragment for calculating Haversine distance.
 * Use with parameterised queries: haversineSql(latParam, lngParam)
 */
const haversineSql = (userLat, userLng) => `
  (
    6371 * acos(
      LEAST(1.0, cos(radians(${userLat})) * cos(radians(latitude))
      * cos(radians(longitude) - radians(${userLng}))
      + sin(radians(${userLat})) * sin(radians(latitude)))
    )
  )
`;

module.exports = { haversineDistance, haversineSql };
